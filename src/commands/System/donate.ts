import { SkyraCommand } from '#lib/structures/SkyraCommand';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { CommandStore, KlasaMessage } from 'klasa';

export default class extends SkyraCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: LanguageKeys.Commands.System.DonateDescription,
			extendedHelp: LanguageKeys.Commands.System.DonateExtended,
			guarded: true
		});
	}

	public async run(message: KlasaMessage) {
		const t = await message.fetchT();
		try {
			const extended = t(this.extendedHelp, { returnObjects: true }).extendedHelp!;
			const response = await message.author.send(extended);
			return message.channel.type === 'text' ? await message.alert(t(LanguageKeys.Commands.System.DmSent)) : response;
		} catch {
			return message.channel.type === 'text' ? null : message.alert(t(LanguageKeys.Commands.System.DmNotSent));
		}
	}
}
