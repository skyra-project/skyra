import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures/commands/SkyraCommand';
import type { GuildMessage } from '#lib/types';
import { PermissionLevels } from '#lib/types/Enums';
import { PreciseTimeout } from '#utils/PreciseTimeout';
import { ApplyOptions } from '@sapphire/decorators';
import { Permissions, TextChannel } from 'discord.js';
import type { TFunction } from 'i18next';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['lock', 'unlock'],
	cooldown: 5,
	subcommands: true,
	description: LanguageKeys.Commands.Moderation.LockdownDescription,
	extendedHelp: LanguageKeys.Commands.Moderation.LockdownExtended,
	runIn: ['text'],
	usage: '<lock|unlock|auto:default> [target:textchannelname] [duration:timespan]',
	usageDelim: ' ',
	permissionLevel: PermissionLevels.Moderator,
	requiredPermissions: ['MANAGE_CHANNELS', 'MANAGE_ROLES']
})
export default class extends SkyraCommand {
	public auto(message: GuildMessage, [channel = message.channel as TextChannel, duration]: [TextChannel, number?]) {
		return message.guild.security.lockdowns.has(channel.id) ? this.unlock(message, [channel]) : this.lock(message, [channel, duration]);
	}

	public async unlock(message: GuildMessage, [channel = message.channel as TextChannel]: [TextChannel]) {
		const t = await message.fetchT();
		const entry = message.guild.security.lockdowns.get(channel.id);

		if (typeof entry === 'undefined') {
			throw t(LanguageKeys.Commands.Moderation.LockdownUnlocked, { channel: channel.toString() });
		}

		return entry.timeout ? entry.timeout.stop() : this._unlock(message, t, channel);
	}

	public async lock(message: GuildMessage, [channel = message.channel as TextChannel, duration]: [TextChannel, number?]) {
		const t = await message.fetchT();

		// If there was a lockdown, abort lock
		if (message.guild.security.lockdowns.has(channel.id)) {
			throw t(LanguageKeys.Commands.Moderation.LockdownLocked, { channel: channel.toString() });
		}

		// Get the role, then check if the user could send messages
		const role = message.guild.roles.cache.get(message.guild.id)!;
		const couldSend = channel.permissionsFor(role)?.has(Permissions.FLAGS.SEND_MESSAGES, false) ?? true;
		if (!couldSend) throw t(LanguageKeys.Commands.Moderation.LockdownLocked, { channel: channel.toString() });

		// If they can send, begin locking
		const response = await message.send(t(LanguageKeys.Commands.Moderation.LockdownLocking, { channel: channel.toString() }));
		await channel.updateOverwrite(role, { SEND_MESSAGES: false });
		if (message.channel.postable) {
			await response.edit(t(LanguageKeys.Commands.Moderation.LockdownLock, { channel: channel.toString() })).catch(() => null);
		}

		// Create the timeout
		const timeout = duration ? new PreciseTimeout(duration) : null;
		message.guild.security.lockdowns.set(channel.id, { timeout });

		// Perform cleanup later
		if (timeout) {
			await timeout.run();
			await this._unlock(message, t, channel);
		}
	}

	private async _unlock(message: GuildMessage, t: TFunction, channel: TextChannel) {
		channel.guild.security.lockdowns.delete(channel.id);
		await channel.updateOverwrite(channel.guild.id, { SEND_MESSAGES: true });
		return message.send(t(LanguageKeys.Commands.Moderation.LockdownOpen, { channel: channel.toString() }));
	}
}
