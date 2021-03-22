import type { GuildEntity } from '#lib/database';
import type { KeyOfType } from '#lib/types/Utils';
import { Event } from '@sapphire/framework';
import type { Guild, MessageEmbed } from 'discord.js';
import type { HardPunishment } from './ModerationMessageEvent';
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
		const duration = await guild.readSettings(this.hardPunishmentPath.actionDuration);
		await this.createActionAndSend(guild, () =>
			guild.security.actions.warning({
				userID,
				moderatorID: process.env.CLIENT_ID,
				reason: '[Auto-Moderation] Threshold Reached.',
				duration
			})
		);
	}

	protected async onKick(guild: Guild, userID: string) {
		await this.createActionAndSend(guild, () =>
			guild.security.actions.kick({
				userID,
				moderatorID: process.env.CLIENT_ID,
				reason: '[Auto-Moderation] Threshold Reached.'
			})
		);
	}

	protected async onMute(guild: Guild, userID: string) {
		const duration = await guild.readSettings(this.hardPunishmentPath.actionDuration);
		await this.createActionAndSend(guild, () =>
			guild.security.actions.mute({
				userID,
				moderatorID: process.env.CLIENT_ID,
				reason: '[Auto-Moderation] Threshold Reached.',
				duration
			})
		);
	}

	protected async onSoftBan(guild: Guild, userID: string) {
		await this.createActionAndSend(guild, () =>
			guild.security.actions.softBan(
				{
					userID,
					moderatorID: process.env.CLIENT_ID,
					reason: '[Auto-Moderation] Threshold Reached.'
				},
				1
			)
		);
	}

	protected async onBan(guild: Guild, userID: string) {
		const duration = await guild.readSettings(this.hardPunishmentPath.actionDuration);

		await this.createActionAndSend(guild, () =>
			guild.security.actions.ban(
				{
					userID,
					moderatorID: process.env.CLIENT_ID,
					reason: '[Auto-Moderation] Threshold Reached.',
					duration
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

	protected abstract keyEnabled: KeyOfType<GuildEntity, boolean>;
	protected abstract softPunishmentPath: KeyOfType<GuildEntity, number>;
	protected abstract hardPunishmentPath: HardPunishment;
	protected abstract preProcess(args: Readonly<V>): Promise<T | null> | T | null;
	protected abstract onLog(args: Readonly<V>, value: T): unknown;
	protected abstract onDelete(args: Readonly<V>, value: T): unknown;
	protected abstract onAlert(args: Readonly<V>, value: T): unknown;
	protected abstract onLogMessage(args: Readonly<V>, value: T): Promise<MessageEmbed> | MessageEmbed;
}
