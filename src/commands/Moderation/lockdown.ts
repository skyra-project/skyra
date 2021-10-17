import { LanguageKeys } from '#lib/i18n/languageKeys';
import { LockdownManager, SkyraCommand } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { PermissionLevels } from '#lib/types/Enums';
import { floatPromise } from '#utils/common';
import { assertNonThread, getSecurity } from '#utils/functions';
import { clearAccurateTimeout, setAccurateTimeout } from '#utils/Timers';
import { channelMention } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import { canSendMessages, NonThreadGuildTextBasedChannelTypes } from '@sapphire/discord.js-utilities';
import { CommandOptionsRunTypeEnum } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import { PermissionFlagsBits } from 'discord-api-types/v9';
import { PermissionOverwriteOptions, Permissions, Role } from 'discord.js';
import type { TFunction } from 'i18next';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['lock', 'unlock'],
	description: LanguageKeys.Commands.Moderation.LockdownDescription,
	detailedDescription: LanguageKeys.Commands.Moderation.LockdownExtended,
	permissionLevel: PermissionLevels.Moderator,
	requiredClientPermissions: [PermissionFlagsBits.ManageChannels, PermissionFlagsBits.ManageRoles],
	runIn: [CommandOptionsRunTypeEnum.GuildAny],
	subCommands: ['lock', 'unlock', { input: 'auto', default: true }]
})
export class UserCommand extends SkyraCommand {
	private readonly permissionsToDeny =
		PermissionFlagsBits.SendMessages |
		PermissionFlagsBits.AddReactions |
		PermissionFlagsBits.UsePublicThreads | // CREATE_PUBLIC_THREADS
		PermissionFlagsBits.UsePrivateThreads | // CREATE_PRIVATE_THREADS
		(1n << 38n); // SEND_MESSAGES_IN_THREADS

	private readonly clientPermissionsToAllow =
		PermissionFlagsBits.SendMessages | PermissionFlagsBits.ManageChannels | PermissionFlagsBits.ManageRoles;

	public messageRun(message: GuildMessage, args: SkyraCommand.Args, context: SkyraCommand.Context) {
		if (context.commandName === 'lock') return this.lock(message, args);
		if (context.commandName === 'unlock') return this.unlock(message, args);
		return super.messageRun(message, args, context);
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
			this.error(LanguageKeys.Commands.Moderation.LockdownLocked, { channel: channelMention(channel.id) });
		}

		const isAllowedToManageChannel = this.skyraIsAllowedToManageChannel(channel);

		if (!isAllowedToManageChannel) {
			this.error(LanguageKeys.Commands.Moderation.LockdownMissingPermissions, { channel: channelMention(channel.id) });
		}

		const allowed = this.roleIsAllowedToSendMessages(role, channel);

		// If they can send, begin locking
		const response = await send(message, args.t(LanguageKeys.Commands.Moderation.LockdownLocking, { channel: channelMention(channel.id) }));
		await channel.permissionOverwrites.set([
			...channel.permissionOverwrites.cache.values(),
			{
				id: role.id,
				allow: 0n,
				deny: this.permissionsToDeny,
				type: 'role'
			},
			{
				id: this.container.client.user!.id,
				allow: this.clientPermissionsToAllow,
				type: 'member'
			}
		]);
		if (canSendMessages(message.channel)) {
			await response.edit(args.t(LanguageKeys.Commands.Moderation.LockdownLock, { channel: channelMention(channel.id) })).catch(() => null);
		}

		// Create the timeout
		const timeout = duration
			? setAccurateTimeout(() => floatPromise(this.performUnlock(message, args.t, role, channel, allowed)), duration)
			: null;
		getSecurity(message.guild).lockdowns.add(role, channel, { allowed, timeout });
	}

	private skyraIsAllowedToManageChannel(channel: NonThreadGuildTextBasedChannelTypes): boolean | undefined {
		const targetChannelClientPermissions = channel.permissionsFor(this.container.client.user!);
		return targetChannelClientPermissions?.has([PermissionFlagsBits.ManageRoles | PermissionFlagsBits.ManageChannels]);
	}

	private roleIsAllowedToSendMessages(role: Role, channel: NonThreadGuildTextBasedChannelTypes): boolean | null {
		return channel.permissionOverwrites.cache.get(role.id)?.allow.has(Permissions.FLAGS.SEND_MESSAGES, false) ?? null;
	}

	private async handleUnlock(message: GuildMessage, args: SkyraCommand.Args, role: Role, channel: NonThreadGuildTextBasedChannelTypes) {
		const entry = this.getLock(role, channel);
		if (entry === null) this.error(LanguageKeys.Commands.Moderation.LockdownUnlocked, { channel: channelMention(channel.id) });

		const isAllowedToManageChannel = this.skyraIsAllowedToManageChannel(channel);

		if (!isAllowedToManageChannel) {
			this.error(LanguageKeys.Commands.Moderation.LockdownMissingPermissions, { channel: channelMention(channel.id) });
		}

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

		const overwritesForRole = channel.permissionOverwrites.cache.get(role.id);
		if (overwritesForRole === undefined) return;

		// If the permission overwrite matches the permissionsToDeny, then clean up the entire permission; if the permission
		// was denied, reset it to the default state, otherwise don't run an extra query
		if (overwritesForRole.allow.bitfield === 0n && overwritesForRole.deny.bitfield === this.permissionsToDeny) {
			await overwritesForRole.delete();
		} else {
			const permissionsToAllow: PermissionOverwriteOptions = {};

			// Check and assign all the permissions to allow
			if (overwritesForRole.deny.has(PermissionFlagsBits.SendMessages)) {
				permissionsToAllow.SEND_MESSAGES = allowed;
			}

			if (overwritesForRole.deny.has(PermissionFlagsBits.AddReactions)) {
				permissionsToAllow.ADD_REACTIONS = allowed;
			}

			if (overwritesForRole.deny.has(PermissionFlagsBits.UsePublicThreads)) {
				permissionsToAllow.USE_PUBLIC_THREADS = allowed;
			}

			if (overwritesForRole.deny.has(PermissionFlagsBits.UsePrivateThreads)) {
				permissionsToAllow.USE_PRIVATE_THREADS = allowed;
			}

			if (overwritesForRole.deny.has(1n << 38n)) {
				permissionsToAllow.SEND_MESSAGES_IN_THREADS = allowed;
			}

			// If we have any permissions to allow, then edit the overwrite
			if (Object.keys(permissionsToAllow).length) {
				await overwritesForRole.edit(permissionsToAllow);
			}
		}

		if (canSendMessages(message.channel)) {
			const content = t(LanguageKeys.Commands.Moderation.LockdownOpen, { channel: channelMention(channel.id) });
			await send(message, content);
		}

		const overwritesForClient = channel.permissionOverwrites.cache.get(this.container.client.user!.id);
		if (overwritesForClient === undefined) return;

		if (overwritesForClient.allow.bitfield === this.clientPermissionsToAllow) {
			await overwritesForClient.delete();
		} else {
			const clientPermissionsToRemove: PermissionOverwriteOptions = {};

			// Check and assign all the permissions to allow
			if (overwritesForClient.allow.has(PermissionFlagsBits.SendMessages)) {
				clientPermissionsToRemove.SEND_MESSAGES = allowed;
			}

			if (overwritesForClient.allow.has(PermissionFlagsBits.ManageChannels)) {
				clientPermissionsToRemove.MANAGE_CHANNELS = allowed;
			}

			if (overwritesForClient.allow.has(PermissionFlagsBits.ManageRoles)) {
				clientPermissionsToRemove.MANAGE_ROLES = allowed;
			}

			// If we have any permissions to allow, then edit the overwrite
			if (Object.keys(clientPermissionsToRemove).length) {
				await overwritesForClient.edit(clientPermissionsToRemove);
			}
		}
	}

	private getLock(role: Role, channel: NonThreadGuildTextBasedChannelTypes): LockdownManager.Entry | null {
		const entry = getSecurity(channel.guild).lockdowns.get(channel.id)?.get(role.id);
		if (entry) return entry;

		const permissions = channel.permissionOverwrites.cache.get(role.id)?.deny.has(Permissions.FLAGS.SEND_MESSAGES);
		return permissions === true ? { allowed: null, timeout: null } : null;
	}
}
