import { CommandStore, KlasaClient, KlasaMessage } from 'klasa';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';

export default class extends SkyraCommand {

	public constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			description: (language) => language.get('COMMAND_DONATE_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_DONATE_EXTENDED'),
			guarded: true
		});
	}

	public async run(message: KlasaMessage) {
		return message.author.send(message.language.get('COMMAND_DONATE_EXTENDED'))
			.then(() => { if (message.channel.type !== 'dm') message.alert(message.language.get('COMMAND_DM_SENT')); })
			.catch(() => { if (message.channel.type !== 'dm') message.alert(message.language.get('COMMAND_DM_NOT_SENT')); });
	}

}
