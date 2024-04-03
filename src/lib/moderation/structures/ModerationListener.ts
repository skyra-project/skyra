import { readSettings, type GuildSettingsOfType } from '#lib/database';
import { ModerationActions } from '#lib/moderation/actions/index';
import type { HardPunishment } from '#lib/moderation/structures/ModerationMessageListener';
import { AutoModerationOnInfraction, SelfModeratorHardActionFlags } from '#lib/moderation/structures/SelfModeratorBitField';
import { seconds } from '#utils/common';
import { getModeration } from '#utils/functions';
import type { EmbedBuilder } from '@discordjs/builders';
import { Listener, type Awaitable } from '@sapphire/framework';
import type { Guild } from 'discord.js';

export abstract class ModerationListener<V extends unknown[], T = unknown> extends Listener {
	public abstract override run(...params: V): unknown;

	protected processSoftPunishment(args: Readonly<V>, preProcessed: T, bitfield: number) {
		if (AutoModerationOnInfraction.has(bitfield, AutoModerationOnInfraction.flags.Delete)) this.onDelete(args, preProcessed);
		if (AutoModerationOnInfraction.has(bitfield, AutoModerationOnInfraction.flags.Alert)) this.onAlert(args, preProcessed);
		if (AutoModerationOnInfraction.has(bitfield, AutoModerationOnInfraction.flags.Log)) this.onLog(args, preProcessed);
	}

	protected async processHardPunishment(guild: Guild, userId: string, action: SelfModeratorHardActionFlags) {
		switch (action) {
			case SelfModeratorHardActionFlags.Warning:
				await this.onWarning(guild, userId);
				break;
			case SelfModeratorHardActionFlags.Kick:
				await this.onKick(guild, userId);
				break;
			case SelfModeratorHardActionFlags.Mute:
				await this.onMute(guild, userId);
				break;
			case SelfModeratorHardActionFlags.Softban:
				await this.onSoftBan(guild, userId);
				break;
			case SelfModeratorHardActionFlags.Ban:
				await this.onBan(guild, userId);
				break;
			case SelfModeratorHardActionFlags.None:
				break;
		}
	}

	protected async onWarning(guild: Guild, userId: string) {
		const duration = await readSettings(guild, this.hardPunishmentPath.actionDuration);
		await this.createActionAndSend(guild, () =>
			ModerationActions.warning.apply(guild, { user: userId, reason: '[Auto-Moderation] Threshold Reached.', duration })
		);
	}

	protected async onKick(guild: Guild, userId: string) {
		await this.createActionAndSend(guild, () =>
			ModerationActions.kick.apply(guild, { user: userId, reason: '[Auto-Moderation] Threshold Reached.' })
		);
	}

	protected async onMute(guild: Guild, userId: string) {
		const duration = await readSettings(guild, this.hardPunishmentPath.actionDuration);
		await this.createActionAndSend(guild, () =>
			ModerationActions.mute.apply(guild, { user: userId, reason: '[Auto-Moderation] Threshold Reached.', duration })
		);
	}

	protected async onSoftBan(guild: Guild, userId: string) {
		await this.createActionAndSend(guild, () =>
			ModerationActions.softban.apply(
				guild,
				{ user: userId, reason: '[Auto-Moderation] Threshold Reached.' },
				{ context: seconds.fromMinutes(5) }
			)
		);
	}

	protected async onBan(guild: Guild, userId: string) {
		const duration = await readSettings(guild, this.hardPunishmentPath.actionDuration);

		await this.createActionAndSend(guild, () =>
			ModerationActions.ban.apply(guild, { user: userId, reason: '[Auto-Moderation] Threshold Reached.', duration })
		);
	}

	protected async createActionAndSend(guild: Guild, performAction: () => unknown): Promise<void> {
		const unlock = getModeration(guild).createLock();
		await performAction();
		unlock();
	}

	protected abstract keyEnabled: GuildSettingsOfType<boolean>;
	protected abstract softPunishmentPath: GuildSettingsOfType<number>;
	protected abstract hardPunishmentPath: HardPunishment;
	protected abstract preProcess(args: Readonly<V>): Awaitable<T | null>;
	protected abstract onLog(args: Readonly<V>, value: T): unknown;
	protected abstract onDelete(args: Readonly<V>, value: T): unknown;
	protected abstract onAlert(args: Readonly<V>, value: T): unknown;
	protected abstract onLogMessage(args: Readonly<V>, value: T): Awaitable<EmbedBuilder>;
}

export namespace ModerationListener {
	export type Options = Listener.Options;
	export type JSON = Listener.JSON;
	export type Context = Listener.Context;
}
