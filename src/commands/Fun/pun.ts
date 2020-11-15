import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';
import { Mime } from '@utils/constants';
import { fetch } from '@utils/util';
import { KlasaMessage } from 'klasa';

@ApplyOptions<SkyraCommandOptions>({
	cooldown: 5,
	description: (language) => language.get(LanguageKeys.Commands.Fun.PunDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Fun.PunExtended),
	spam: true
})
export default class extends SkyraCommand {
	public async run(message: KlasaMessage) {
		const language = await message.fetchLanguage();

		const { joke } = await fetch<PunResultOk>('https://icanhazdadjoke.com/', {
			headers: {
				Accept: Mime.Types.ApplicationJson
			}
		}).catch(() => {
			throw language.get(LanguageKeys.Commands.Fun.PunError);
		});
		return message.send(joke);
	}
}

export interface PunResultOk {
	id: string;
	joke: string;
	status: number;
}
