import { SkyraCommand, SkyraCommandOptions } from '#lib/structures/SkyraCommand';
import { PermissionLevels } from '#lib/types/Enums';
import { GuildMessage } from '#lib/types/index';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { PreciseTimeout } from '#utils/PreciseTimeout';
import { ApplyOptions } from '@skyra/decorators';
import { Permissions, TextChannel } from 'discord.js';
import { Language } from 'klasa';

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['lock', 'unlock'],
	cooldown: 5,
	subcommands: true,
	description: (language) => language.get(LanguageKeys.Commands.Moderation.LockdownDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Moderation.LockdownExtended),
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
		const language = await message.fetchLanguage();
		const entry = message.guild.security.lockdowns.get(channel.id);

		if (typeof entry === 'undefined') {
			throw language.get(LanguageKeys.Commands.Moderation.LockdownUnlocked, { channel: channel.toString() });
		}

		return entry.timeout ? entry.timeout.stop() : this._unlock(message, language, channel);
	}

	public async lock(message: GuildMessage, [channel = message.channel as TextChannel, duration]: [TextChannel, number?]) {
		const language = await message.fetchLanguage();

		// If there was a lockdown, abort lock
		if (message.guild.security.lockdowns.has(channel.id)) {
			throw language.get(LanguageKeys.Commands.Moderation.LockdownLocked, { channel: channel.toString() });
		}

		// Get the role, then check if the user could send messages
		const role = message.guild.roles.cache.get(message.guild.id)!;
		const couldSend = channel.permissionsFor(role)?.has(Permissions.FLAGS.SEND_MESSAGES, false) ?? true;
		if (!couldSend) throw language.get(LanguageKeys.Commands.Moderation.LockdownLocked, { channel: channel.toString() });

		// If they can send, begin locking
		const response = await message.sendLocale(LanguageKeys.Commands.Moderation.LockdownLocking, [{ channel: channel.toString() }]);
		await channel.updateOverwrite(role, { SEND_MESSAGES: false });
		if (message.channel.postable) {
			await response.edit(language.get(LanguageKeys.Commands.Moderation.LockdownLock, { channel: channel.toString() })).catch(() => null);
		}

		// Create the timeout
		const timeout = duration ? new PreciseTimeout(duration) : null;
		message.guild.security.lockdowns.set(channel.id, { timeout });

		// Perform cleanup later
		if (timeout) {
			await timeout.run();
			await this._unlock(message, language, channel);
		}
	}

	private async _unlock(message: GuildMessage, language: Language, channel: TextChannel) {
		channel.guild.security.lockdowns.delete(channel.id);
		await channel.updateOverwrite(channel.guild.id, { SEND_MESSAGES: true });
		return message.send(language.get(LanguageKeys.Commands.Moderation.LockdownOpen, { channel: channel.toString() }));
	}
}
