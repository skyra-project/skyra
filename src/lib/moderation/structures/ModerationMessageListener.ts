import { readSettings, type AdderKey, type GuildSettingsOfType, type ReadonlyGuildEntity } from '#lib/database';
import type { AdderError } from '#lib/database/utils/Adder';
import { getT } from '#lib/i18n';
import { ModerationActions } from '#lib/moderation/actions/index';
import { AutoModerationOnInfraction, AutoModerationPunishment } from '#lib/moderation/structures/AutoModerationOnInfraction';
import { Events, type GuildMessage, type TypedFT, type TypedT } from '#lib/types';
import { floatPromise, seconds } from '#utils/common';
import { getModeration, isModerator } from '#utils/functions';
import { EmbedBuilder } from '@discordjs/builders';
import { canSendMessages, type GuildTextBasedChannelTypes } from '@sapphire/discord.js-utilities';
import { Listener } from '@sapphire/framework';
import type { TFunction } from '@sapphire/plugin-i18next';
import { isNullishOrZero, type Awaitable, type Nullish } from '@sapphire/utilities';
import type { GuildMember } from 'discord.js';

export abstract class ModerationMessageListener<T = unknown> extends Listener {
	private readonly keyEnabled: GuildSettingsOfType<boolean>;
	private readonly ignoredRolesPath: GuildSettingsOfType<readonly string[]>;
	private readonly ignoredChannelsPath: GuildSettingsOfType<readonly string[]>;
	private readonly softPunishmentPath: GuildSettingsOfType<number>;
	private readonly hardPunishmentPath: HardPunishment;
	private readonly reasonLanguageKey: TypedT<string>;
	private readonly reasonLanguageKeyWithMaximum: TypedFT<{ amount: number; maximum: number }, string>;

	public constructor(context: ModerationMessageListener.LoaderContext, options: ModerationMessageListener.Options) {
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

		const settings = await readSettings(message.guild);

		const logChannelId = settings.channelsLogsModeration;
		const filter = settings[this.softPunishmentPath];
		const t = getT(settings.language);
		this.processSoftPunishment(message, logChannelId, t, filter, preProcessed);

		if (this.hardPunishmentPath === null) return;

		const adder = settings.adders[this.hardPunishmentPath.adder];
		if (!adder) return this.processHardPunishment(message, t, 0, 0);

		const points = typeof preProcessed === 'number' ? preProcessed : 1;
		try {
			adder.add(message.author.id, points);
		} catch (error) {
			await this.processHardPunishment(message, t, (error as AdderError).amount, adder.maximum);
		}
	}

	protected processSoftPunishment(message: GuildMessage, logChannelId: string | Nullish, language: TFunction, bitfield: number, preProcessed: T) {
		if (AutoModerationOnInfraction.has(bitfield, AutoModerationOnInfraction.flags.Delete) && message.deletable) {
			floatPromise(this.onDelete(message, language, preProcessed) as any);
		}

		if (AutoModerationOnInfraction.has(bitfield, AutoModerationOnInfraction.flags.Alert) && canSendMessages(message.channel)) {
			floatPromise(this.onAlert(message, language, preProcessed) as any);
		}

		if (AutoModerationOnInfraction.has(bitfield, AutoModerationOnInfraction.flags.Log)) {
			floatPromise(this.onLog(message, logChannelId, language, preProcessed) as any);
		}
	}

	protected async processHardPunishment(message: GuildMessage, language: TFunction, points: number, maximum: number) {
		const settings = await readSettings(message.guild);
		const action = settings[this.hardPunishmentPath.action];
		const duration = settings[this.hardPunishmentPath.actionDuration];
		switch (action) {
			case AutoModerationPunishment.Warning:
				await this.onWarning(message, language, points, maximum, duration);
				break;
			case AutoModerationPunishment.Kick:
				await this.onKick(message, language, points, maximum);
				break;
			case AutoModerationPunishment.Timeout:
				await this.onTimeout(message, language, points, maximum, duration);
				break;
			case AutoModerationPunishment.Mute:
				await this.onMute(message, language, points, maximum, duration);
				break;
			case AutoModerationPunishment.Softban:
				await this.onSoftBan(message, language, points, maximum);
				break;
			case AutoModerationPunishment.Ban:
				await this.onBan(message, language, points, maximum, duration);
				break;
		}
	}

	protected async onWarning(message: GuildMessage, t: TFunction, points: number, maximum: number, duration: number | null) {
		await this.createActionAndSend(message, () =>
			ModerationActions.warning.apply(message.guild, { user: message.author, reason: this.#getReason(t, points, maximum), duration })
		);
	}

	protected async onKick(message: GuildMessage, t: TFunction, points: number, maximum: number) {
		await this.createActionAndSend(message, () =>
			ModerationActions.kick.apply(message.guild, { user: message.author, reason: this.#getReason(t, points, maximum) })
		);
	}

	protected async onTimeout(message: GuildMessage, t: TFunction, points: number, maximum: number, duration: number | null) {
		if (isNullishOrZero(duration)) return;
		await this.createActionAndSend(message, () =>
			ModerationActions.timeout.apply(message.guild, { user: message.author, reason: this.#getReason(t, points, maximum), duration })
		);
	}

	protected async onMute(message: GuildMessage, t: TFunction, points: number, maximum: number, duration: number | null) {
		await this.createActionAndSend(message, () =>
			ModerationActions.mute.apply(message.guild, { user: message.author, reason: this.#getReason(t, points, maximum), duration })
		);
	}

	protected async onSoftBan(message: GuildMessage, t: TFunction, points: number, maximum: number) {
		await this.createActionAndSend(message, () =>
			ModerationActions.softban.apply(
				message.guild,
				{ user: message.author, reason: this.#getReason(t, points, maximum) },
				{ context: seconds.fromMinutes(5) }
			)
		);
	}

	protected async onBan(message: GuildMessage, t: TFunction, points: number, maximum: number, duration: number | null) {
		await this.createActionAndSend(message, () =>
			ModerationActions.ban.apply(message.guild, { user: message.author, reason: this.#getReason(t, points, maximum), duration })
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
			'channelsLogsModeration',
			this.onLogMessage.bind(this, message, language, value)
		);
	}

	protected abstract preProcess(message: GuildMessage): Promise<T | null> | T | null;
	protected abstract onDelete(message: GuildMessage, language: TFunction, value: T): Awaitable<unknown>;
	protected abstract onAlert(message: GuildMessage, language: TFunction, value: T): Awaitable<unknown>;
	protected abstract onLogMessage(message: GuildMessage, language: TFunction, value: T): Awaitable<EmbedBuilder>;

	private async checkPreRun(message: GuildMessage) {
		const settings = await readSettings(message.guild);
		return settings[this.keyEnabled] && this.checkMessageChannel(settings, message.channel) && this.checkMemberRoles(settings, message.member);
	}

	private checkMessageChannel(settings: ReadonlyGuildEntity, channel: GuildTextBasedChannelTypes) {
		const globalIgnore = settings.selfmodIgnoreChannels;
		if (globalIgnore.includes(channel.id)) return false;

		const localIgnore = settings[this.ignoredChannelsPath] as readonly string[];
		if (localIgnore.includes(channel.id)) return false;

		return true;
	}

	private checkMemberRoles(settings: ReadonlyGuildEntity, member: GuildMember | null) {
		if (member === null) return false;

		const ignoredRoles = settings[this.ignoredRolesPath];
		if (ignoredRoles.length === 0) return true;

		const { roles } = member;
		return !ignoredRoles.some((id) => roles.cache.has(id));
	}

	#getReason(t: TFunction, points: number, maximum: number) {
		return maximum === 0 ? t(this.reasonLanguageKey) : t(this.reasonLanguageKeyWithMaximum, { amount: points, maximum });
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
		reasonLanguageKey: TypedT<string>;
		reasonLanguageKeyWithMaximum: TypedFT<{ amount: number; maximum: number }, string>;
	}
	export type JSON = Listener.JSON;
	export type LoaderContext = Listener.LoaderContext;
}
