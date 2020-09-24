import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';
import { KlasaMessage } from 'klasa';

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['pong'],
	cooldown: 5,
	description: (language) => language.get(LanguageKeys.Commands.General.PingDescription),
	guarded: true
})
export default class extends SkyraCommand {
	public async run(message: KlasaMessage) {
		const msg = await message.sendLocale(LanguageKeys.Commands.General.Ping);
		return message.sendLocale(LanguageKeys.Commands.General.PingPong, [
			{
				diff: (msg.editedTimestamp || msg.createdTimestamp) - (message.editedTimestamp || message.createdTimestamp),
				ping: Math.round(this.client.ws.ping)
			}
		]);
	}
}
