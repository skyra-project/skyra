import { MessageOptions, TextChannel } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['talk'],
			description: language => language.tget('COMMAND_ECHO_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_ECHO_EXTENDED'),
			guarded: true,
			permissionLevel: 10,
			usage: '[channel:channel] [message:string] [...]',
			usageDelim: ' '
		});
	}

	public async run(message: KlasaMessage, [channel = message.channel as TextChannel, ...content]: [TextChannel?, ...string[]]) {
		if (message.deletable) message.nuke().catch(() => null);

		const attachment = message.attachments.size ? message.attachments.first()!.url : null;
		const mesContent = content.length ? content.join(' ') : '';

		if (!mesContent && !attachment) {
			throw 'I have no content nor attachment to send, please write something.';
		}

		const options: MessageOptions = {};
		if (attachment) options.files = [{ attachment }];

		await channel.send(mesContent, options);
		if (channel !== message.channel) await message.alert(`Message successfully sent to ${channel}`);

		return message;
	}

}
