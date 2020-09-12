import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { ApplyOptions } from '@skyra/decorators';
import { KlasaMessage } from 'klasa';

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['pong'],
	cooldown: 5,
	description: (language) => language.get('commandPingDescription'),
	guarded: true
})
export default class extends SkyraCommand {
	public async run(message: KlasaMessage) {
		const msg = await message.sendLocale('commandPing');
		return message.sendLocale('commandPingPong', [
			{
				diff: (msg.editedTimestamp || msg.createdTimestamp) - (message.editedTimestamp || message.createdTimestamp),
				ping: Math.round(this.client.ws.ping)
			}
		]);
	}
}
