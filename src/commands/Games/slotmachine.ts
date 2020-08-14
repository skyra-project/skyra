import { DbSet } from '@lib/structures/DbSet';
import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { ApplyOptions } from '@skyra/decorators';
import { Emojis } from '@utils/constants';
import { Slotmachine } from '@utils/Games/Slotmachine';
import { KlasaMessage } from 'klasa';

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['slot', 'slots', 'slotmachines'],
	bucket: 2,
	cooldown: 7,
	description: (language) => language.tget('COMMAND_SLOTMACHINE_DESCRIPTION'),
	extendedHelp: (language) => language.tget('COMMAND_SLOTMACHINE_EXTENDED'),
	requiredPermissions: ['ATTACH_FILES'],
	runIn: ['text'],
	usage: '<wager:wager>'
})
export default class extends SkyraCommand {
	public async run(message: KlasaMessage, [wager]: [number]) {
		const { users } = await DbSet.connect();
		const settings = await users.ensureProfile(message.author.id);
		const balance = settings.money;
		if (balance < wager) {
			throw message.language.tget('GAMES_NOT_ENOUGH_MONEY', balance);
		}

		const [attachment, amount] = await new Slotmachine(message, wager, settings).run();
		const TITLES = message.language.tget('COMMAND_SLOTMACHINE_TITLES');

		return message.sendMessage(
			[`**${TITLES.PREVIOUS}:** ${balance} ${Emojis.Shiny}`, `**${TITLES.NEW}:** ${amount} ${Emojis.Shiny}`].join('\n'),
			{ files: [{ attachment, name: 'slots.png' }] }
		);
	}
}
