import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';
import { KlasaMessage } from 'klasa';

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['details', 'what'],
	cooldown: 5,
	description: (language) => language.get(LanguageKeys.Commands.General.InfoDescription),
	guarded: true
})
export default class extends SkyraCommand {
	public async run(message: KlasaMessage) {
		const content = (await message.fetchLocale(LanguageKeys.Commands.General.InfoBody)).join('\n');
		return message.send(content);
	}
}
