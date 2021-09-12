import { LanguageKeys } from '#lib/i18n/languageKeys';
import { LockdownManager, SkyraCommand } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { PermissionLevels } from '#lib/types/Enums';
import { floatPromise } from '#utils/common';
import { assertNonThread, getSecurity } from '#utils/functions';
import { clearAccurateTimeout, setAccurateTimeout } from '#utils/Timers';
import { ApplyOptions } from '@sapphire/decorators';
import { canSendMessages, NonThreadGuildTextBasedChannelTypes } from '@sapphire/discord.js-utilities';
import { CommandOptionsRunTypeEnum } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import { PermissionFlagsBits } from 'discord-api-types/payloads/v9';
import { Permissions, Role } from 'discord.js';
import type { TFunction } from 'i18next';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['lock', 'unlock'],
	description: LanguageKeys.Commands.Moderation.LockdownDescription,
	extendedHelp: LanguageKeys.Commands.Moderation.LockdownExtended,
	permissionLevel: PermissionLevels.Moderator,
	requiredClientPermissions: [PermissionFlagsBits.ManageChannels, PermissionFlagsBits.ManageRoles],
	runIn: [CommandOptionsRunTypeEnum.GuildAny],
	subCommands: ['lock', 'unlock', { input: 'auto', default: true }]
})
export class UserCommand extends SkyraCommand {
	public run(message: GuildMessage, args: SkyraCommand.Args, context: SkyraCommand.Context) {
		if (context.commandName === 'lock') return this.lock(message, args);
		if (context.commandName === 'unlock') return this.unlock(message, args);
		return super.run(message, args, context);
	}

	public async auto(message: GuildMessage, args: SkyraCommand.Args) {
		const role = await args.pick('roleName').catch(() => message.guild.roles.everyone);
		const channel = args.finished ? assertNonThread(message.channel) : await args.pick('textChannelName');
		if (this.getLock(role, channel)) return this.handleUnlock(message, args, role, channel);

		const duration = args.finished ? null : await args.pick('timespan', { minimum: 0 });
		return this.handleLock(message, args, role, channel, duration);
	}

	public async unlock(message: GuildMessage, args: SkyraCommand.Args) {
		const role = await args.pick('roleName').catch(() => message.guild.roles.everyone);
		const channel = args.finished ? assertNonThread(message.channel) : await args.pick('textChannelName');
		return this.handleUnlock(message, args, role, channel);
	}

	public async lock(message: GuildMessage, args: SkyraCommand.Args) {
		const role = await args.pick('roleName').catch(() => message.guild.roles.everyone);
		const channel = args.finished ? assertNonThread(message.channel) : await args.pick('textChannelName');
		const duration = args.finished ? null : await args.pick('timespan', { minimum: 0 });
		return this.handleLock(message, args, role, channel, duration);
	}

	private async handleLock(
		message: GuildMessage,
		args: SkyraCommand.Args,
		role: Role,
		channel: NonThreadGuildTextBasedChannelTypes,
		duration: number | null
	) {
		// If there was a lockdown, abort lock
		const lock = this.getLock(role, channel);
		if (lock !== null) {
			this.error(LanguageKeys.Commands.Moderation.LockdownLocked, { channel: channel.toString() });
		}

		const allowed = this.isAllowed(role, channel);

		// If they can send, begin locking
		const response = await send(message, args.t(LanguageKeys.Commands.Moderation.LockdownLocking, { channel: channel.toString() }));
		await channel.permissionOverwrites.edit(role, { SEND_MESSAGES: false });
		if (canSendMessages(message.channel)) {
			await response.edit(args.t(LanguageKeys.Commands.Moderation.LockdownLock, { channel: channel.toString() })).catch(() => null);
		}

		// Create the timeout
		const timeout = duration
			? setAccurateTimeout(() => floatPromise(this.performUnlock(message, args.t, role, channel, allowed)), duration)
			: null;
		getSecurity(message.guild).lockdowns.add(role, channel, { allowed, timeout });
	}

	private isAllowed(role: Role, channel: NonThreadGuildTextBasedChannelTypes): boolean | null {
		return channel.permissionOverwrites.cache.get(role.id)?.allow.has(Permissions.FLAGS.SEND_MESSAGES, false) ?? null;
	}

	private async handleUnlock(message: GuildMessage, args: SkyraCommand.Args, role: Role, channel: NonThreadGuildTextBasedChannelTypes) {
		const entry = this.getLock(role, channel);
		if (entry === null) this.error(LanguageKeys.Commands.Moderation.LockdownUnlocked, { channel: channel.toString() });
		if (entry.timeout) clearAccurateTimeout(entry.timeout);
		return this.performUnlock(message, args.t, role, channel, entry.allowed);
	}

	private async performUnlock(
		message: GuildMessage,
		t: TFunction,
		role: Role,
		channel: NonThreadGuildTextBasedChannelTypes,
		allowed: boolean | null
	) {
		getSecurity(channel.guild).lockdowns.remove(role, channel);

		const overwrites = channel.permissionOverwrites.cache.get(role.id);
		if (overwrites === undefined) return;

		// If the only permission overwrite is the denied SEND_MESSAGES, clean up the entire permission; if the permission
		// was denied, reset it to the default state, otherwise don't run an extra query
		if (overwrites.allow.bitfield === 0n && overwrites.deny.bitfield === Permissions.FLAGS.SEND_MESSAGES) {
			await overwrites.delete();
		} else if (overwrites.deny.has(Permissions.FLAGS.SEND_MESSAGES)) {
			await overwrites.edit({ SEND_MESSAGES: allowed });
		}

		if (canSendMessages(message.channel)) {
			const content = t(LanguageKeys.Commands.Moderation.LockdownOpen, { channel: channel.toString() });
			await send(message, content);
		}
	}

	private getLock(role: Role, channel: NonThreadGuildTextBasedChannelTypes): LockdownManager.Entry | null {
		const entry = getSecurity(channel.guild).lockdowns.get(channel.id)?.get(role.id);
		if (entry) return entry;

		const permissions = channel.permissionOverwrites.cache.get(role.id)?.deny.has(Permissions.FLAGS.SEND_MESSAGES);
		return permissions === true ? { allowed: null, timeout: null } : null;
	}
}
