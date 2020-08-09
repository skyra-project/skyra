import { CLIENT_ID } from '@root/config';
import { GuildSecurity } from '@utils/Security/GuildSecurity';
import { Guild, MessageEmbed } from 'discord.js';
import { Event } from 'klasa';
import { SelfModeratorBitField, SelfModeratorHardActionFlags } from './SelfModeratorBitField';

export abstract class ModerationEvent<V extends unknown[], T = unknown> extends Event {
	public abstract run(...params: V): unknown;

	protected processSoftPunishment(args: Readonly<V>, preProcessed: T, bitField: SelfModeratorBitField) {
		if (bitField.has(SelfModeratorBitField.FLAGS.DELETE)) this.onDelete(args, preProcessed);
		if (bitField.has(SelfModeratorBitField.FLAGS.ALERT)) this.onAlert(args, preProcessed);
		if (bitField.has(SelfModeratorBitField.FLAGS.LOG)) this.onLog(args, preProcessed);
	}

	protected async processHardPunishment(guild: Guild, userID: string, action: SelfModeratorHardActionFlags) {
		switch (action) {
			case SelfModeratorHardActionFlags.Warning:
				await this.onWarning(guild, userID);
				break;
			case SelfModeratorHardActionFlags.Kick:
				await this.onKick(guild, userID);
				break;
			case SelfModeratorHardActionFlags.Mute:
				await this.onMute(guild, userID);
				break;
			case SelfModeratorHardActionFlags.SoftBan:
				await this.onSoftBan(guild, userID);
				break;
			case SelfModeratorHardActionFlags.Ban:
				await this.onBan(guild, userID);
				break;
			case SelfModeratorHardActionFlags.None:
				break;
		}
	}

	protected async onWarning(guild: Guild, userID: string) {
		await this.createActionAndSend(guild, () =>
			guild.security.actions.warning({
				userID,
				moderatorID: CLIENT_ID,
				reason: '[Auto-Moderation] Threshold Reached.',
				duration: guild.settings.get(this.hardPunishmentPath!.actionDuration) as number | null
			})
		);
	}

	protected async onKick(guild: Guild, userID: string) {
		await this.createActionAndSend(guild, () =>
			guild.security.actions.kick({
				userID,
				moderatorID: CLIENT_ID,
				reason: '[Auto-Moderation] Threshold Reached.'
			})
		);
	}

	protected async onMute(guild: Guild, userID: string) {
		await this.createActionAndSend(guild, () =>
			guild.security.actions.mute({
				userID,
				moderatorID: CLIENT_ID,
				reason: '[Auto-Moderation] Threshold Reached.',
				duration: guild.settings.get(this.hardPunishmentPath!.actionDuration) as number | null
			})
		);
	}

	protected async onSoftBan(guild: Guild, userID: string) {
		await this.createActionAndSend(guild, () =>
			guild.security.actions.softBan(
				{
					userID,
					moderatorID: CLIENT_ID,
					reason: '[Auto-Moderation] Threshold Reached.'
				},
				1
			)
		);
	}

	protected async onBan(guild: Guild, userID: string) {
		await this.createActionAndSend(guild, () =>
			guild.security.actions.ban(
				{
					userID,
					moderatorID: CLIENT_ID,
					reason: '[Auto-Moderation] Threshold Reached.',
					duration: guild.settings.get(this.hardPunishmentPath!.actionDuration) as number | null
				},
				0
			)
		);
	}

	protected async createActionAndSend(guild: Guild, performAction: () => unknown): Promise<void> {
		const unlock = guild.moderation.createLock();
		await performAction();
		unlock();
	}

	protected abstract keyEnabled: string;
	protected abstract softPunishmentPath: string;
	protected abstract hardPunishmentPath: HardPunishment | null;
	protected abstract preProcess(args: Readonly<V>): Promise<T | null> | T | null;
	protected abstract onLog(args: Readonly<V>, value: T): unknown;
	protected abstract onDelete(args: Readonly<V>, value: T): unknown;
	protected abstract onAlert(args: Readonly<V>, value: T): unknown;
	protected abstract onLogMessage(args: Readonly<V>, value: T): Promise<MessageEmbed> | MessageEmbed;
}

export interface HardPunishment<A = string> {
	action: A;
	actionDuration: string;
	adder: keyof GuildSecurity['adders'];
	adderMaximum: string;
	adderDuration: string;
}
