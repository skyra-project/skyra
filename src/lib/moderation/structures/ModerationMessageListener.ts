import { GuildEntity, GuildSettings, readSettings, type AdderKey, type GuildSettingsOfType } from '#lib/database';
import type { AdderError } from '#lib/database/utils/Adder';
import { SelfModeratorBitField, SelfModeratorHardActionFlags } from '#lib/moderation/structures/SelfModeratorBitField';
import { Events, type CustomFunctionGet, type CustomGet, type GuildMessage } from '#lib/types';
import { floatPromise, seconds } from '#utils/common';
import { getModeration, getSecurity, isModerator } from '#utils/functions';
import { EmbedBuilder } from '@discordjs/builders';
import { canSendMessages, type GuildTextBasedChannelTypes } from '@sapphire/discord.js-utilities';
import { Listener } from '@sapphire/framework';
import type { TFunction } from '@sapphire/plugin-i18next';
import type { Awaitable, Nullish } from '@sapphire/utilities';
import type { GuildMember } from 'discord.js';

export abstract class ModerationMessageListener<T = unknown> extends Listener {
	private readonly keyEnabled: GuildSettingsOfType<boolean>;
	private readonly ignoredRolesPath: GuildSettingsOfType<readonly string[]>;
	private readonly ignoredChannelsPath: GuildSettingsOfType<readonly string[]>;
	private readonly softPunishmentPath: GuildSettingsOfType<number>;
	private readonly hardPunishmentPath: HardPunishment;
	private readonly reasonLanguageKey: CustomGet<string, string>;
	private readonly reasonLanguageKeyWithMaximum: CustomFunctionGet<string, { amount: number; maximum: number }, string>;

	public constructor(context: ModerationMessageListener.Context, options: ModerationMessageListener.Options) {
		super(context, { ...options, event: Events.GuildUserMessage });

		this.keyEnabled = options.keyEnabled;
		this.ignoredRolesPath = options.ignoredRolesPath;
		this.ignoredChannelsPath = options.ignoredChannelsPath;
		this.softPunishmentPath = options.softPunishmentPath;
		this.hardPunishmentPath = options.hardPunishmentPath;
		this.reasonLanguageKey = options.reasonLanguageKey;
		this.reasonLanguageKeyWithMaximum = options.reasonLanguageKeyWithMaximum;
	}

	public async run(message: GuildMessage) {
		const shouldRun = await this.checkPreRun(message);
		if (!shouldRun) return;

		if (await isModerator(message.member)) return;

		const preProcessed = await this.preProcess(message);
		if (preProcessed === null) return;

		const [logChannelId, filter, adder, language] = await readSettings(message.guild, (settings) => [
			settings[GuildSettings.Channels.Logs.Moderation],
			settings[this.softPunishmentPath],
			settings.adders[this.hardPunishmentPath.adder],
			settings.getLanguage()
		]);
		const bitField = new SelfModeratorBitField(filter);
		this.processSoftPunishment(message, logChannelId, language, bitField, preProcessed);

		if (this.hardPunishmentPath === null) return;

		if (!adder) return this.processHardPunishment(message, language, 0, 0);

		const points = typeof preProcessed === 'number' ? preProcessed : 1;
		try {
			adder.add(message.author.id, points);
		} catch (error) {
			await this.processHardPunishment(message, language, (error as AdderError).amount, adder.maximum);
		}
	}

	protected processSoftPunishment(
		message: GuildMessage,
		logChannelId: string | Nullish,
		language: TFunction,
		bitField: SelfModeratorBitField,
		preProcessed: T
	) {
		if (bitField.has(SelfModeratorBitField.FLAGS.DELETE) && message.deletable) {
			floatPromise(this.onDelete(message, language, preProcessed) as any);
		}

		if (bitField.has(SelfModeratorBitField.FLAGS.ALERT) && canSendMessages(message.channel)) {
			floatPromise(this.onAlert(message, language, preProcessed) as any);
		}

		if (bitField.has(SelfModeratorBitField.FLAGS.LOG)) {
			floatPromise(this.onLog(message, logChannelId, language, preProcessed) as any);
		}
	}

	protected async processHardPunishment(message: GuildMessage, language: TFunction, points: number, maximum: number) {
		const [action, duration] = await readSettings(message.guild, [this.hardPunishmentPath.action, this.hardPunishmentPath.actionDuration]);
		switch (action) {
			case SelfModeratorHardActionFlags.Warning:
				await this.onWarning(message, language, points, maximum, duration);
				break;
			case SelfModeratorHardActionFlags.Kick:
				await this.onKick(message, language, points, maximum);
				break;
			case SelfModeratorHardActionFlags.Mute:
				await this.onMute(message, language, points, maximum, duration);
				break;
			case SelfModeratorHardActionFlags.SoftBan:
				await this.onSoftBan(message, language, points, maximum);
				break;
			case SelfModeratorHardActionFlags.Ban:
				await this.onBan(message, language, points, maximum, duration);
				break;
		}
	}

	protected async onWarning(message: GuildMessage, t: TFunction, points: number, maximum: number, duration: number | null) {
		await this.createActionAndSend(message, () =>
			getSecurity(message.guild).actions.warning({
				userId: message.author.id,
				moderatorId: process.env.CLIENT_ID,
				reason: maximum === 0 ? t(this.reasonLanguageKey) : t(this.reasonLanguageKeyWithMaximum, { amount: points, maximum }),
				duration
			})
		);
	}

	protected async onKick(message: GuildMessage, t: TFunction, points: number, maximum: number) {
		await this.createActionAndSend(message, () =>
			getSecurity(message.guild).actions.kick({
				userId: message.author.id,
				moderatorId: process.env.CLIENT_ID,
				reason: maximum === 0 ? t(this.reasonLanguageKey) : t(this.reasonLanguageKeyWithMaximum, { amount: points, maximum })
			})
		);
	}

	protected async onMute(message: GuildMessage, t: TFunction, points: number, maximum: number, duration: number | null) {
		await this.createActionAndSend(message, () =>
			getSecurity(message.guild).actions.mute({
				userId: message.author.id,
				moderatorId: process.env.CLIENT_ID,
				reason: maximum === 0 ? t(this.reasonLanguageKey) : t(this.reasonLanguageKeyWithMaximum, { amount: points, maximum }),
				duration
			})
		);
	}

	protected async onSoftBan(message: GuildMessage, t: TFunction, points: number, maximum: number) {
		await this.createActionAndSend(message, () =>
			getSecurity(message.guild).actions.softBan(
				{
					userId: message.author.id,
					moderatorId: process.env.CLIENT_ID,
					reason: maximum === 0 ? t(this.reasonLanguageKey) : t(this.reasonLanguageKeyWithMaximum, { amount: points, maximum })
				},
				seconds.fromMinutes(5)
			)
		);
	}

	protected async onBan(message: GuildMessage, t: TFunction, points: number, maximum: number, duration: number | null) {
		await this.createActionAndSend(message, () =>
			getSecurity(message.guild).actions.ban({
				userId: message.author.id,
				moderatorId: process.env.CLIENT_ID,
				reason: maximum === 0 ? t(this.reasonLanguageKey) : t(this.reasonLanguageKeyWithMaximum, { amount: points, maximum }),
				duration
			})
		);
	}

	protected async createActionAndSend(message: GuildMessage, performAction: () => unknown): Promise<void> {
		const unlock = getModeration(message.guild).createLock();
		await performAction();
		unlock();
	}

	protected onLog(message: GuildMessage, logChannelId: string | Nullish, language: TFunction, value: T): Awaitable<void> {
		this.container.client.emit(
			Events.GuildMessageLog,
			message.guild,
			logChannelId,
			GuildSettings.Channels.Logs.Moderation,
			this.onLogMessage.bind(this, message, language, value)
		);
	}

	protected abstract preProcess(message: GuildMessage): Promise<T | null> | T | null;
	protected abstract onDelete(message: GuildMessage, language: TFunction, value: T): Awaitable<unknown>;
	protected abstract onAlert(message: GuildMessage, language: TFunction, value: T): Awaitable<unknown>;
	protected abstract onLogMessage(message: GuildMessage, language: TFunction, value: T): Awaitable<EmbedBuilder>;

	private checkPreRun(message: GuildMessage) {
		return readSettings(
			message.guild,
			(settings) =>
				settings[this.keyEnabled] && this.checkMessageChannel(settings, message.channel) && this.checkMemberRoles(settings, message.member)
		);
	}

	private checkMessageChannel(settings: GuildEntity, channel: GuildTextBasedChannelTypes) {
		const globalIgnore = settings[GuildSettings.Selfmod.IgnoreChannels];
		if (globalIgnore.includes(channel.id)) return false;

		const localIgnore = settings[this.ignoredChannelsPath] as readonly string[];
		if (localIgnore.includes(channel.id)) return false;

		return true;
	}

	private checkMemberRoles(settings: GuildEntity, member: GuildMember | null) {
		if (member === null) return false;

		const ignoredRoles = settings[this.ignoredRolesPath];
		if (ignoredRoles.length === 0) return true;

		const { roles } = member;
		return !ignoredRoles.some((id) => roles.cache.has(id));
	}
}

export interface HardPunishment {
	action: GuildSettingsOfType<number>;
	actionDuration: GuildSettingsOfType<number | null>;
	adder: AdderKey;
}

export namespace ModerationMessageListener {
	export interface Options extends Listener.Options {
		keyEnabled: GuildSettingsOfType<boolean>;
		ignoredRolesPath: GuildSettingsOfType<readonly string[]>;
		ignoredChannelsPath: GuildSettingsOfType<readonly string[]>;
		softPunishmentPath: GuildSettingsOfType<number>;
		hardPunishmentPath: HardPunishment;
		reasonLanguageKey: CustomGet<string, string>;
		reasonLanguageKeyWithMaximum: CustomFunctionGet<string, { amount: number; maximum: number }, string>;
	}
	export type JSON = Listener.JSON;
	export type Context = Listener.Context;
}
