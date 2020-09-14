import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { ApplyOptions } from '@skyra/decorators';
import { KlasaMessage } from 'klasa';

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['details', 'what'],
	cooldown: 5,
	description: (language) => language.get('commandInfoDescription'),
	guarded: true
})
export default class extends SkyraCommand {
	public async run(message: KlasaMessage) {
		const content = message.language.get('commandInfoBody').join('\n');
		return message.send(content);
	}
}
