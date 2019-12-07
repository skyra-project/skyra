import { Monitor, KlasaMessage } from 'klasa';
import { SelfModeratorBitField, SelfModeratorHardActionFlags } from './SelfModeratorBitField';
import { GuildSettings } from '../types/settings/GuildSettings';
import { GuildSecurity } from '../util/Security/GuildSecurity';
import { Adder } from '../util/Adder';
import { MessageLogsEnum } from '../util/constants';
import { Events, PermissionLevels } from '../types/Enums';
import { MessageEmbed, GuildMember, TextChannel } from 'discord.js';
import { CustomGet } from '../types/settings/Shared';

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
		if (!maximum) return this.processHardPunishment(message);

		const duration = message.guild!.settings.get(this.hardPunishmentPath.adderDuration);
		if (!duration) return this.processHardPunishment(message);

		const $adder = this.hardPunishmentPath.adder;
		if (message.guild!.security.adders[$adder] === null) {
			message.guild!.security.adders[$adder] = new Adder(maximum, duration);
		}

		try {
			const points = typeof preProcessed === 'number' ? preProcessed : 1;
			message.guild!.security.adders[$adder]!.add(message.author.id, points);
		} catch {
			await this.processHardPunishment(message);
		}
	}

	public shouldRun(message: KlasaMessage) {
		return this.enabled
			&& message.guild !== null
			&& message.author !== null
			&& message.webhookID === null
			&& message.type === 'DEFAULT'
			&& message.author.id !== this.client.user!.id
			&& message.guild.settings.get(this.keyEnabled)
			&& this.checkMessageChannel(message.channel as TextChannel)
			&& this.checkMemberRoles(message.member);
	}

	protected processSoftPunishment(message: KlasaMessage, bitField: SelfModeratorBitField, preProcessed: T) {
		if (bitField.has(SelfModeratorBitField.FLAGS.DELETE) && message.deletable) this.onDelete(message, preProcessed);
		if (bitField.has(SelfModeratorBitField.FLAGS.ALERT) && message.channel.postable) this.onAlert(message, preProcessed);
		if (bitField.has(SelfModeratorBitField.FLAGS.LOG)) this.onLog(message, preProcessed);
	}

	protected async processHardPunishment(message: KlasaMessage) {
		const action = message.guild!.settings.get(this.hardPunishmentPath!.action);
		switch (action) {
			case SelfModeratorHardActionFlags.Warning:
				await this.onWarning(message);
				break;
			case SelfModeratorHardActionFlags.Kick:
				await this.onKick(message);
				break;
			case SelfModeratorHardActionFlags.Mute:
				await this.onMute(message);
				break;
			case SelfModeratorHardActionFlags.SoftBan:
				await this.onSoftBan(message);
				break;
			case SelfModeratorHardActionFlags.Ban:
				await this.onBan(message);
				break;
		}
	}

	protected async onWarning(message: KlasaMessage) {
		await this.createActionAndSend(message, () => message.guild!.security.actions.warning({
			user_id: message.author.id,
			reason: '[Auto-Moderation] Threshold Reached.',
			duration: message.guild!.settings.get(this.hardPunishmentPath!.actionDuration)
		}));
	}

	protected async onKick(message: KlasaMessage) {
		await this.createActionAndSend(message, () => message.guild!.security.actions.kick({
			user_id: message.author.id,
			reason: '[Auto-Moderation] Threshold Reached.'
		}));
	}

	protected async onMute(message: KlasaMessage) {
		await this.createActionAndSend(message, () => message.guild!.security.actions.mute({
			user_id: message.author.id,
			reason: '[Auto-Moderation] Threshold Reached.',
			duration: message.guild!.settings.get(this.hardPunishmentPath!.actionDuration)
		}));
	}

	protected async onSoftBan(message: KlasaMessage) {
		await this.createActionAndSend(message, () => message.guild!.security.actions.softBan({
			user_id: message.author.id,
			reason: '[Auto-Moderation] Threshold Reached.'
		}, 1));
	}

	protected async onBan(message: KlasaMessage) {
		await this.createActionAndSend(message, () => message.guild!.security.actions.ban({
			user_id: message.author.id,
			reason: '[Auto-Moderation] Threshold Reached.',
			duration: message.guild!.settings.get(this.hardPunishmentPath!.actionDuration)
		}, 0));
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
	protected abstract preProcess(message: KlasaMessage): Promise<T | null> | T | null;
	protected abstract onDelete(message: KlasaMessage, value: T): unknown;
	protected abstract onAlert(message: KlasaMessage, value: T): unknown;
	protected abstract onLogMessage(message: KlasaMessage, value: T): MessageEmbed;

	private checkMessageChannel(channel: TextChannel) {
		return !(channel.guild.settings.get(GuildSettings.Selfmod.IgnoreChannels).includes(channel.id)
			|| channel.guild.settings.get(this.ignoredChannelsPath).includes(channel.id));
	}

	private checkMemberRoles(member: GuildMember | null) {
		if (member === null) return false;

		const ignoredRoles = member.guild.settings.get(this.ignoredRolesPath);
		if (ignoredRoles.length === 0) return true;

		const { roles } = member;
		return !ignoredRoles.some(id => roles.has(id));
	}

}

export interface HardPunishment {
	action: CustomGet<string, SelfModeratorHardActionFlags>;
	actionDuration: CustomGet<string, number | null>;
	adder: keyof GuildSecurity['adders'];
	adderMaximum: CustomGet<string, number | null>;
	adderDuration: CustomGet<string, number | null>;
}
