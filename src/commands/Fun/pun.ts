import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { ApplyOptions } from '@sapphire/decorators';
import { fetch } from '@sapphire/fetch';
import { MimeTypes } from '@sapphire/plugin-api';
import type { Message } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	description: LanguageKeys.Commands.Fun.PunDescription,
	extendedHelp: LanguageKeys.Commands.Fun.PunExtended,
	spam: true
})
export class UserCommand extends SkyraCommand {
	public async run(message: Message) {
		try {
			const { joke } = await fetch<PunResultOk>('https://icanhazdadjoke.com/', {
				headers: {
					Accept: MimeTypes.ApplicationJson
				}
			});
			return message.send(joke);
		} catch {
			this.error(LanguageKeys.Commands.Fun.PunError);
		}
	}
}

export interface PunResultOk {
	id: string;
	joke: string;
	status: number;
}
