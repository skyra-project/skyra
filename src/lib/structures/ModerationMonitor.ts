import { Events, PermissionLevels } from '@lib/types/Enums';
import { GuildSettings } from '@lib/types/settings/GuildSettings';
import { CustomGet } from '@lib/types/settings/Shared';
import { CLIENT_ID } from '@root/config';
import { Adder, AdderError } from '@utils/Adder';
import { MessageLogsEnum } from '@utils/constants';
import { GuildSecurity } from '@utils/Security/GuildSecurity';
import { GuildMember, MessageEmbed, TextChannel } from 'discord.js';
import { KlasaMessage, LanguageKeysComplex, LanguageKeysSimple, Monitor } from 'klasa';
import { SelfModeratorBitField, SelfModeratorHardActionFlags } from './SelfModeratorBitField';

export abstract class ModerationMonitor<T = unknown> extends Monitor {
	public async run(message: KlasaMessage) {
		if (await message.hasAtLeastPermissionLevel(PermissionLevels.Moderator)) return;

		const preProcessed = await this.preProcess(message);
		if (preProcessed === null) return;

		const filter = message.guild!.settings.get(this.softPunishmentPath);
		const bitField = new SelfModeratorBitField(filter);
		this.processSoftPunishment(message, bitField, preProcessed);

		if (this.hardPunishmentPath === null) return;

		const maximum = message.guild!.settings.get(this.hardPunishmentPath.adderMaximum);
		if (!maximum) return this.processHardPunishment(message, 0, 0);

		const duration = message.guild!.settings.get(this.hardPunishmentPath.adderDuration);
		if (!duration) return this.processHardPunishment(message, 0, 0);

		const $adder = this.hardPunishmentPath.adder;
		if (message.guild!.security.adders[$adder] === null) {
			message.guild!.security.adders[$adder] = new Adder(maximum, duration, true);
		}

		const points = typeof preProcessed === 'number' ? preProcessed : 1;
		try {
			message.guild!.security.adders[$adder]!.add(message.author.id, points);
		} catch (error) {
			await this.processHardPunishment(message, (error as AdderError).amount, maximum);
		}
	}

	public shouldRun(message: KlasaMessage) {
		return (
			this.enabled &&
			message.guild !== null &&
			message.author !== null &&
			message.webhookID === null &&
			message.type === 'DEFAULT' &&
			message.author.id !== CLIENT_ID &&
			!message.author.bot &&
			message.guild.settings.get(this.keyEnabled) &&
			this.checkMessageChannel(message.channel as TextChannel) &&
			this.checkMemberRoles(message.member)
		);
	}

	protected processSoftPunishment(message: KlasaMessage, bitField: SelfModeratorBitField, preProcessed: T) {
		if (bitField.has(SelfModeratorBitField.FLAGS.DELETE) && message.deletable) this.onDelete(message, preProcessed);
		if (bitField.has(SelfModeratorBitField.FLAGS.ALERT) && message.channel.postable) this.onAlert(message, preProcessed);
		if (bitField.has(SelfModeratorBitField.FLAGS.LOG)) this.onLog(message, preProcessed);
	}

	protected async processHardPunishment(message: KlasaMessage, points: number, maximum: number) {
		const action = message.guild!.settings.get(this.hardPunishmentPath!.action);
		switch (action) {
			case SelfModeratorHardActionFlags.Warning:
				await this.onWarning(message, points, maximum);
				break;
			case SelfModeratorHardActionFlags.Kick:
				await this.onKick(message, points, maximum);
				break;
			case SelfModeratorHardActionFlags.Mute:
				await this.onMute(message, points, maximum);
				break;
			case SelfModeratorHardActionFlags.SoftBan:
				await this.onSoftBan(message, points, maximum);
				break;
			case SelfModeratorHardActionFlags.Ban:
				await this.onBan(message, points, maximum);
				break;
		}
	}

	protected async onWarning(message: KlasaMessage, points: number, maximum: number) {
		await this.createActionAndSend(message, () =>
			message.guild!.security.actions.warning({
				userID: message.author.id,
				moderatorID: CLIENT_ID,
				reason:
					maximum === 0
						? message.language.get(this.reasonLanguageKey)
						: message.language.get(this.reasonLanguageKeyWithMaximum, { amount: points, maximum }),
				duration: message.guild!.settings.get(this.hardPunishmentPath!.actionDuration)
			})
		);
	}

	protected async onKick(message: KlasaMessage, points: number, maximum: number) {
		await this.createActionAndSend(message, () =>
			message.guild!.security.actions.kick({
				userID: message.author.id,
				moderatorID: CLIENT_ID,
				reason:
					maximum === 0
						? message.language.get(this.reasonLanguageKey)
						: message.language.get(this.reasonLanguageKeyWithMaximum, { amount: points, maximum })
			})
		);
	}

	protected async onMute(message: KlasaMessage, points: number, maximum: number) {
		await this.createActionAndSend(message, () =>
			message.guild!.security.actions.mute({
				userID: message.author.id,
				moderatorID: CLIENT_ID,
				reason:
					maximum === 0
						? message.language.get(this.reasonLanguageKey)
						: message.language.get(this.reasonLanguageKeyWithMaximum, { amount: points, maximum }),
				duration: message.guild!.settings.get(this.hardPunishmentPath!.actionDuration)
			})
		);
	}

	protected async onSoftBan(message: KlasaMessage, points: number, maximum: number) {
		await this.createActionAndSend(message, () =>
			message.guild!.security.actions.softBan(
				{
					userID: message.author.id,
					moderatorID: CLIENT_ID,
					reason:
						maximum === 0
							? message.language.get(this.reasonLanguageKey)
							: message.language.get(this.reasonLanguageKeyWithMaximum, { amount: points, maximum })
				},
				1
			)
		);
	}

	protected async onBan(message: KlasaMessage, points: number, maximum: number) {
		await this.createActionAndSend(message, () =>
			message.guild!.security.actions.ban(
				{
					userID: message.author.id,
					moderatorID: CLIENT_ID,
					reason:
						maximum === 0
							? message.language.get(this.reasonLanguageKey)
							: message.language.get(this.reasonLanguageKeyWithMaximum, { amount: points, maximum }),
					duration: message.guild!.settings.get(this.hardPunishmentPath!.actionDuration)
				},
				0
			)
		);
	}

	protected async createActionAndSend(message: KlasaMessage, performAction: () => unknown): Promise<void> {
		const unlock = message.guild!.moderation.createLock();
		await performAction();
		unlock();
	}

	protected onLog(message: KlasaMessage, value: T) {
		this.client.emit(Events.GuildMessageLog, MessageLogsEnum.Moderation, message.guild, this.onLogMessage.bind(this, message, value));
	}

	protected abstract keyEnabled: CustomGet<string, boolean>;
	protected abstract ignoredRolesPath: CustomGet<string, readonly string[]>;
	protected abstract ignoredChannelsPath: CustomGet<string, readonly string[]>;
	protected abstract softPunishmentPath: CustomGet<string, number>;
	protected abstract hardPunishmentPath: HardPunishment | null;
	protected abstract reasonLanguageKey: Extract<
		LanguageKeysSimple,
		| 'moderationMonitorCapitals'
		| 'moderationMonitorInvites'
		| 'moderationMonitorLinks'
		| 'moderationMonitorMessages'
		| 'moderationMonitorNewlines'
		| 'moderationMonitorWords'
	>;

	protected abstract reasonLanguageKeyWithMaximum: Extract<
		LanguageKeysComplex,
		| 'moderationMonitorCapitalsWithMaximum'
		| 'moderationMonitorInvitesWithMaximum'
		| 'moderationMonitorLinksWithMaximum'
		| 'moderationMonitorMessagesWithMaximum'
		| 'moderationMonitorNewlinesWithMaximum'
		| 'moderationMonitorWordsWithMaximum'
	>;

	protected abstract preProcess(message: KlasaMessage): Promise<T | null> | T | null;
	protected abstract onDelete(message: KlasaMessage, value: T): unknown;
	protected abstract onAlert(message: KlasaMessage, value: T): unknown;
	protected abstract onLogMessage(message: KlasaMessage, value: T): MessageEmbed;

	private checkMessageChannel(channel: TextChannel) {
		return !(
			channel.guild.settings.get(GuildSettings.Selfmod.IgnoreChannels).includes(channel.id) ||
			channel.guild.settings.get(this.ignoredChannelsPath).includes(channel.id)
		);
	}

	private checkMemberRoles(member: GuildMember | null) {
		if (member === null) return false;

		const ignoredRoles = member.guild.settings.get(this.ignoredRolesPath);
		if (ignoredRoles.length === 0) return true;

		const { roles } = member;
		return !ignoredRoles.some((id) => roles.cache.has(id));
	}
}

export interface HardPunishment {
	action: CustomGet<string, SelfModeratorHardActionFlags>;
	actionDuration: CustomGet<string, number | null>;
	adder: keyof GuildSecurity['adders'];
	adderMaximum: CustomGet<string, number | null>;
	adderDuration: CustomGet<string, number | null>;
}
