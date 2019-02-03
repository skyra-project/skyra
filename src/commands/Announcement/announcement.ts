import { MessageEmbed, Role, TextChannel } from 'discord.js';
import { CommandStore, KlasaClient, KlasaMessage } from 'klasa';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { announcementCheck } from '../../lib/util/util';

export default class extends SkyraCommand {

	public constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			aliases: ['announce'],
			bucket: 6,
			cooldown: 30,
			description: (language) => language.get('COMMAND_ANNOUNCEMENT_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_ANNOUNCEMENT_EXTENDED'),
			permissionLevel: 4,
			requiredPermissions: ['MANAGE_ROLES'],
			runIn: ['text'],
			usage: '<announcement:string{,1900}>'
		});
	}

	public async run(message: KlasaMessage, [announcement]: [string]) {
		const announcementID = message.guild.settings.get('channels.announcement') as string;
		if (!announcementID) throw message.language.get('COMMAND_SUBSCRIBE_NO_CHANNEL');

		const channel = message.guild.channels.get(announcementID) as TextChannel;
		if (!channel) throw message.language.get('COMMAND_SUBSCRIBE_NO_CHANNEL');

		if (!channel.postable) throw message.language.get('SYSTEM_CHANNEL_NOT_POSTABLE');

		const role = announcementCheck(message);
		const content = `${message.language.get('COMMAND_ANNOUNCEMENT', role)}\n${announcement}`;

		if (await this.ask(message, content)) {
			await this.send(channel, role, content);
			return message.sendLocale('COMMAND_ANNOUNCEMENT_SUCCESS');
		}

		return message.sendLocale('COMMAND_ANNOUNCEMENT_CANCELLED');
	}

	private ask(message: KlasaMessage, content: string) {
		try {
			return message.ask(message.language.get('COMMAND_ANNOUNCEMENT_PROMPT') as string, {
				embed: new MessageEmbed()
					.setColor(message.member.displayColor || 0xDFDFDF)
					.setDescription(content)
					.setTimestamp()
			});
		} catch (_) {
			return false;
		}
	}

	private async send(channel: TextChannel, role: Role, content: string) {
		await role.edit({ mentionable: true });
		await channel.send(content);
		await role.edit({ mentionable: false });
	}

}
