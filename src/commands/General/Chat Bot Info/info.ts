import { SkyraCommand, SkyraCommandOptions } from '#lib/structures/SkyraCommand';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';
import { KlasaMessage } from 'klasa';

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['details', 'what'],
	cooldown: 5,
	description: LanguageKeys.Commands.General.InfoDescription,
	extendedHelp: LanguageKeys.Commands.General.InfoExtended,
	guarded: true
})
export default class extends SkyraCommand {
	public async run(message: KlasaMessage) {
		return message.send(await message.resolveKey(LanguageKeys.Commands.General.InfoBody));
	}
}
