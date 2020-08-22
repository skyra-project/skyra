import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { CommandStore, KlasaMessage } from 'klasa';

export default class extends SkyraCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: (language) => language.get('commandDonateDescription'),
			extendedHelp: (language) => language.get('commandDonateExtended'),
			guarded: true
		});
	}

	public async run(message: KlasaMessage) {
		try {
			const response = await message.author.send(message.language.get('commandDonateExtended'));
			return message.channel.type === 'dm' ? await message.alert(message.language.get('commandDmSent')) : response;
		} catch {
			return message.channel.type === 'dm' ? null : message.alert(message.language.get('commandDmNotSent'));
		}
	}
}
