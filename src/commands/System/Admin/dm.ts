import { MessageOptions } from 'discord.js';
import { CommandStore, KlasaClient, KlasaMessage, KlasaUser } from 'klasa';
import { SkyraCommand } from '../../../lib/structures/SkyraCommand';

export default class extends SkyraCommand {

	public constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			description: (language) => language.get('COMMAND_DM_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_DM_EXTENDED'),
			guarded: true,
			permissionLevel: 10,
			usage: '<user:user> <message:...string>',
			usageDelim: ' '
		});
	}

	public async run(message: KlasaMessage, [user, content]: [KlasaUser, string]) {
		const attachment = message.attachments.size > 0 ? message.attachments.first().url : null;
		const options = {} as MessageOptions;
		if (attachment) options.files = [{ attachment }];

		return user.send(content, options)
			.then(() => message.alert(`Message successfully sent to ${user}`))
			.catch(() => message.alert(`I am sorry, I could not send the message to ${user}`));
	}

}
