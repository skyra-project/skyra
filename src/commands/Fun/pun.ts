import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { ApplyOptions } from '@sapphire/decorators';
import { fetch } from '@sapphire/fetch';
import { MimeTypes } from '@sapphire/plugin-api';
import { send } from '@sapphire/plugin-editable-commands';
import type { Message } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	description: LanguageKeys.Commands.Fun.PunDescription,
	detailedDescription: LanguageKeys.Commands.Fun.PunExtended,
	spam: true
})
export class UserCommand extends SkyraCommand {
	public async messageRun(message: Message) {
		try {
			const { joke } = await fetch<PunResultOk>('https://icanhazdadjoke.com/', {
				headers: {
					Accept: MimeTypes.ApplicationJson
				}
			});
			return send(message, joke);
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
