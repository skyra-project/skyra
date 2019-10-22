import { MessageOptions } from 'discord.js';
import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';
import { SkyraCommand } from '../../../lib/structures/SkyraCommand';

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: language => language.tget('COMMAND_DM_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_DM_EXTENDED'),
			guarded: true,
			permissionLevel: 10,
			usage: '<user:user> <message:...string>',
			usageDelim: ' '
		});
	}

	public async run(message: KlasaMessage, [user, content]: [KlasaUser, string]) {
		const attachment = message.attachments.size > 0 ? message.attachments.first()!.url : null;
		const options: MessageOptions = {};
		if (attachment) options.files = [{ attachment }];

		try {
			await user.send(content, options);
			return message.alert(`Message successfully sent to ${user}`);
		} catch {
			return message.alert(`I am sorry, I could not send the message to ${user}`);
		}
	}

}
