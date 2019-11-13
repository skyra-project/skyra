import { CommandStore, KlasaMessage } from 'klasa';
import { SkyraCommand } from '../../../lib/structures/SkyraCommand';
import { TextChannel } from 'discord.js';
import { PermissionLevels } from '../../../lib/types/Enums';
import { Time } from '../../../lib/util/constants';

const MAXIMUM_TIME = Time.Hour * 6;

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['sm'],
			cooldown: 10,
			description: language => language.tget('COMMAND_SLOWMODE_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_SLOWMODE_EXTENDED'),
			permissionLevel: PermissionLevels.Moderator,
			requiredPermissions: ['MANAGE_CHANNELS'],
			runIn: ['text'],
			usage: '<reset|off|seconds:integer|cooldown:timespan>'
		});

		this.createCustomResolver('integer', async (arg, possible, message) =>
			(await this.client.arguments.get('integer')!.run(arg, possible, message)) * 1000);
	}

	public async run(message: KlasaMessage, [cooldown]: ['reset' | 'off' | number]) {
		if (cooldown === 'reset' || cooldown === 'off') cooldown = 0;
		else if (cooldown >= MAXIMUM_TIME) throw message.language.get('COMMAND_SLOWMODE_TOO_LONG');
		const channel = message.channel as TextChannel;
		await channel.setRateLimitPerUser(cooldown);
		return message.sendLocale('COMMAND_SLOWMODE_SET', [cooldown]);
	}

}
