import { TextChannel } from 'discord.js';
import { CommandStore, KlasaClient, KlasaMessage } from 'klasa';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { PreciseTimeout } from '../../lib/util/PreciseTimeout';

export default class extends SkyraCommand {

	public constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			aliases: ['lock', 'unlock'],
			cooldown: 5,
			description: (language) => language.get('COMMAND_LOCKDOWN_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_LOCKDOWN_EXTENDED'),
			permissionLevel: 5,
			requiredPermissions: ['MANAGE_CHANNELS', 'MANAGE_ROLES']
		});
	}

	public run(message: KlasaMessage, [channel = message.channel as TextChannel, time]: [TextChannel, Date]) {
		// @ts-ignore
		return this[message.guild.security.lockdowns.has(message.channel.id) ? 'unlock' : 'lock'](message, channel, time);
	}

	public async unlock(message: KlasaMessage, channel: TextChannel) {
		const timeout = message.guild.security.lockdowns.get(channel.id);
		if (typeof timeout === 'undefined') throw message.sendLocale('COMMAND_LOCKDOWN_UNLOCKED', [channel]);
		return timeout ? timeout.stop() : this._unlock(message, channel);
	}

	public async lock(message: KlasaMessage, channel: TextChannel, time: Date) {
		// If there was a lockdown, abort lock
		if (message.guild.security.lockdowns.has(channel.id)) throw message.sendLocale('COMMAND_LOCKDOWN_LOCKED', [channel]);

		const response = await message.sendLocale('COMMAND_LOCKDOWN_LOCKING', [channel]) as KlasaMessage;
		await channel.updateOverwrite(message.guild.roles.get(message.guild.id), { SEND_MESSAGES: false });
		if (message.channel.postable) await response.sendLocale('COMMAND_LOCKDOWN_LOCK', [channel]);

		// Create the timeout
		const timeout = time ? new PreciseTimeout(time.getTime() - Date.now()) : null;
		message.guild.security.lockdowns.set(channel.id, timeout);

		// Perform cleanup later
		if (timeout) timeout.run()
			.then(this._unlock.bind(this, message, channel))
			.catch(this._unlock.bind(this, message, channel));
	}

	private async _unlock(message: KlasaMessage, channel: TextChannel) {
		channel.guild.security.lockdowns.delete(channel.id);
		await channel.updateOverwrite(channel.guild.id, { SEND_MESSAGES: true });
		return message.sendLocale('COMMAND_LOCKDOWN_OPEN', [channel]);
	}

}
