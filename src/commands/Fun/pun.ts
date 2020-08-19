import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { ApplyOptions } from '@skyra/decorators';
import { Mime } from '@utils/constants';
import { fetch } from '@utils/util';
import { KlasaMessage } from 'klasa';

@ApplyOptions<SkyraCommandOptions>({
	cooldown: 5,
	description: (language) => language.get('COMMAND_PUN_DESCRIPTION'),
	extendedHelp: (language) => language.get('COMMAND_PUN_EXTENDED'),
	spam: true
})
export default class extends SkyraCommand {
	public async run(message: KlasaMessage) {
		const { joke } = await fetch<PunResultOk>('https://icanhazdadjoke.com/', {
			headers: {
				Accept: Mime.Types.ApplicationJson
			}
		}).catch(() => {
			throw message.language.get('COMMAND_PUN_ERROR');
		});
		return message.send(joke);
	}
}

export interface PunResultOk {
	id: string;
	joke: string;
	status: number;
}
