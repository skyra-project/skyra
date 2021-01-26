import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { PermissionLevels } from '#lib/types/Enums';
import { PreciseTimeout } from '#utils/PreciseTimeout';
import { LockdownEntry } from '#utils/Security/GuildSecurity';
import { ApplyOptions } from '@sapphire/decorators';
import { Permissions, TextChannel } from 'discord.js';
import type { TFunction } from 'i18next';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['lock', 'unlock'],
	cooldown: 5,
	subCommands: ['lock', 'unlock', { input: 'auto', default: true }],
	description: LanguageKeys.Commands.Moderation.LockdownDescription,
	extendedHelp: LanguageKeys.Commands.Moderation.LockdownExtended,
	runIn: ['text'],
	permissionLevel: PermissionLevels.Moderator,
	permissions: ['MANAGE_CHANNELS', 'MANAGE_ROLES']
})
export class UserCommand extends SkyraCommand {
	public async auto(message: GuildMessage, args: SkyraCommand.Args) {
		if (args.commandContext.commandName === 'lock') return this.lock(message, args);
		if (args.commandContext.commandName === 'unlock') return this.unlock(message, args);

		const channel = args.finished ? (message.channel as TextChannel) : await args.pick('textChannelName');
		if (this.hasLock(channel)) return this.handleUnlock(message, args, channel);

		const duration = args.finished ? null : await args.pick('timespan');
		return this.handleLock(message, args, channel, duration);
	}

	public async unlock(message: GuildMessage, args: SkyraCommand.Args) {
		const channel = args.finished ? (message.channel as TextChannel) : await args.pick('textChannelName');
		return this.handleUnlock(message, args, channel);
	}

	public async lock(message: GuildMessage, args: SkyraCommand.Args) {
		const channel = args.finished ? (message.channel as TextChannel) : await args.pick('textChannelName');
		const duration = args.finished ? null : await args.pick('timespan');
		return this.handleLock(message, args, channel, duration);
	}

	private async handleLock(message: GuildMessage, args: SkyraCommand.Args, channel: TextChannel, duration: number | null) {
		// If there was a lockdown, abort lock
		if (this.hasLock(channel)) {
			this.error(LanguageKeys.Commands.Moderation.LockdownLocked, { channel: channel.toString() });
		}

		// Get the role, then check if the user could send messages
		const role = message.guild.roles.cache.get(message.guild.id)!;
		const couldSend = channel.permissionsFor(role)?.has(Permissions.FLAGS.SEND_MESSAGES, false) ?? true;
		if (!couldSend) this.error(LanguageKeys.Commands.Moderation.LockdownLocked, { channel: channel.toString() });

		// If they can send, begin locking
		const response = await message.send(args.t(LanguageKeys.Commands.Moderation.LockdownLocking, { channel: channel.toString() }));
		await channel.updateOverwrite(role, { SEND_MESSAGES: false });
		if (message.channel.postable) {
			await response.edit(args.t(LanguageKeys.Commands.Moderation.LockdownLock, { channel: channel.toString() })).catch(() => null);
		}

		// Create the timeout
		const timeout = duration ? new PreciseTimeout(duration) : null;
		message.guild.security.lockdowns.set(channel.id, { timeout });

		// Perform cleanup later
		if (timeout) {
			await timeout.run();
			await this._unlock(message, args.t, channel);
		}
	}

	private async handleUnlock(message: GuildMessage, args: SkyraCommand.Args, channel: TextChannel) {
		const entry = this.getLock(channel);
		if (entry === null) this.error(LanguageKeys.Commands.Moderation.LockdownUnlocked, { channel: channel.toString() });
		return entry.timeout ? entry.timeout.stop() : this._unlock(message, args.t, channel);
	}

	private async _unlock(message: GuildMessage, t: TFunction, channel: TextChannel) {
		channel.guild.security.lockdowns.delete(channel.id);
		await channel.updateOverwrite(channel.guild.id, { SEND_MESSAGES: true });
		return message.send(t(LanguageKeys.Commands.Moderation.LockdownOpen, { channel: channel.toString() }));
	}

	private hasLock(channel: TextChannel): boolean {
		return (
			channel.guild.security.lockdowns.has(channel.id) ||
			!channel.permissionsFor(channel.guild.roles.everyone)!.has(Permissions.FLAGS.SEND_MESSAGES)
		);
	}

	private getLock(channel: TextChannel): LockdownEntry | null {
		const entry = channel.guild.security.lockdowns.get(channel.id);
		if (entry) return entry;

		const permissions = channel.permissionsFor(channel.guild.roles.everyone)!;
		return permissions.has(Permissions.FLAGS.SEND_MESSAGES) ? null : { timeout: null };
	}
}
