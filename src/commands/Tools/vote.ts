import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { ApplyOptions } from '@skyra/decorators';
import { KlasaMessage } from 'klasa';

@ApplyOptions<SkyraCommandOptions>({
	cooldown: 5,
	description: (language) => language.get('commandVoteDescription'),
	extendedHelp: (language) => language.get('commandVoteExtended'),
	requiredPermissions: ['ADD_REACTIONS', 'READ_MESSAGE_HISTORY'],
	usage: '<title:string>'
})
export default class extends SkyraCommand {
	public async run(message: KlasaMessage) {
		for (const reaction of ['👍', '👎', '🤷']) {
			if (!message.reactions.cache.has(reaction)) await message.react(reaction);
		}

		return message;
	}
}
