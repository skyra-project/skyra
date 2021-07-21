import { LanguageKeys } from '#lib/i18n/languageKeys';
import { LockdownManager, SkyraCommand } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { PermissionLevels } from '#lib/types/Enums';
import { floatPromise } from '#utils/common';
import { canSendMessages } from '#utils/functions';
import { clearAccurateTimeout, setAccurateTimeout } from '#utils/Timers';
import { ApplyOptions } from '@sapphire/decorators';
import { Permissions, Role, TextChannel } from 'discord.js';
import type { TFunction } from 'i18next';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['lock', 'unlock'],
	cooldown: 5,
	subCommands: ['lock', 'unlock', { input: 'auto', default: true }],
	description: LanguageKeys.Commands.Moderation.LockdownDescription,
	extendedHelp: LanguageKeys.Commands.Moderation.LockdownExtended,
	runIn: ['text', 'news'],
	permissionLevel: PermissionLevels.Moderator,
	permissions: ['MANAGE_CHANNELS', 'MANAGE_ROLES']
})
export class UserCommand extends SkyraCommand {
	public run(message: GuildMessage, args: SkyraCommand.Args, context: SkyraCommand.Context) {
		if (context.commandName === 'lock') return this.lock(message, args);
		if (context.commandName === 'unlock') return this.unlock(message, args);
		return super.run(message, args, context);
	}

	public async auto(message: GuildMessage, args: SkyraCommand.Args) {
		const role = await args.pick('roleName').catch(() => message.guild.roles.everyone);
		const channel = args.finished ? (message.channel as TextChannel) : await args.pick('textChannelName');
		if (this.getLock(role, channel)) return this.handleUnlock(message, args, role, channel);

		const duration = args.finished ? null : await args.pick('timespan');
		return this.handleLock(message, args, role, channel, duration);
	}

	public async unlock(message: GuildMessage, args: SkyraCommand.Args) {
		const role = await args.pick('roleName').catch(() => message.guild.roles.everyone);
		const channel = args.finished ? (message.channel as TextChannel) : await args.pick('textChannelName');
		return this.handleUnlock(message, args, role, channel);
	}

	public async lock(message: GuildMessage, args: SkyraCommand.Args) {
		const role = await args.pick('roleName').catch(() => message.guild.roles.everyone);
		const channel = args.finished ? (message.channel as TextChannel) : await args.pick('textChannelName');
		const duration = args.finished ? null : await args.pick('timespan');
		return this.handleLock(message, args, role, channel, duration);
	}

	private async handleLock(message: GuildMessage, args: SkyraCommand.Args, role: Role, channel: TextChannel, duration: number | null) {
		// If there was a lockdown, abort lock
		const lock = this.getLock(role, channel);
		if (lock !== null) {
			this.error(LanguageKeys.Commands.Moderation.LockdownLocked, { channel: channel.toString() });
		}

		const allowed = this.isAllowed(role, channel);

		// If they can send, begin locking
		const response = await message.send(args.t(LanguageKeys.Commands.Moderation.LockdownLocking, { channel: channel.toString() }));
		await channel.updateOverwrite(role, { SEND_MESSAGES: false });
		if (canSendMessages(message.channel)) {
			await response.edit(args.t(LanguageKeys.Commands.Moderation.LockdownLock, { channel: channel.toString() })).catch(() => null);
		}

		// Create the timeout
		const timeout = duration
			? setAccurateTimeout(() => floatPromise(this.performUnlock(message, args.t, role, channel, allowed)), duration)
			: null;
		message.guild.security.lockdowns.add(role, channel, { allowed, timeout });
	}

	private isAllowed(role: Role, channel: TextChannel): boolean | null {
		return channel.permissionOverwrites.get(role.id)?.allow.has(Permissions.FLAGS.SEND_MESSAGES, false) ?? null;
	}

	private async handleUnlock(message: GuildMessage, args: SkyraCommand.Args, role: Role, channel: TextChannel) {
		const entry = this.getLock(role, channel);
		if (entry === null) this.error(LanguageKeys.Commands.Moderation.LockdownUnlocked, { channel: channel.toString() });
		if (entry.timeout) clearAccurateTimeout(entry.timeout);
		return this.performUnlock(message, args.t, role, channel, entry.allowed);
	}

	private async performUnlock(message: GuildMessage, t: TFunction, role: Role, channel: TextChannel, allowed: boolean | null) {
		channel.guild.security.lockdowns.remove(role, channel);

		const overwrites = channel.permissionOverwrites.get(role.id);
		if (overwrites === undefined) return;

		// If the only permission overwrite is the denied SEND_MESSAGES, clean up the entire permission; if the permission
		// was denied, reset it to the default state, otherwise don't run an extra query
		if (overwrites.allow.bitfield === 0 && overwrites.deny.bitfield === Permissions.FLAGS.SEND_MESSAGES) {
			await overwrites.delete();
		} else if (overwrites.deny.has(Permissions.FLAGS.SEND_MESSAGES)) {
			await overwrites.update({ SEND_MESSAGES: allowed });
		}

		if (canSendMessages(message.channel)) {
			await message.send(t(LanguageKeys.Commands.Moderation.LockdownOpen, { channel: channel.toString() }));
		}
	}

	private getLock(role: Role, channel: TextChannel): LockdownManager.Entry | null {
		const entry = channel.guild.security.lockdowns.get(channel.id)?.get(role.id);
		if (entry) return entry;

		const permissions = channel.permissionOverwrites.get(role.id)?.deny.has(Permissions.FLAGS.SEND_MESSAGES);
		return permissions === true ? { allowed: null, timeout: null } : null;
	}
}
