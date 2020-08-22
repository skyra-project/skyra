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
	description: (language) => language.get('commandSlotmachineDescription'),
	extendedHelp: (language) => language.get('commandSlotmachineExtended'),
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
			throw message.language.get('gamesNotEnoughMoney', { money: balance });
		}

		const [attachment, amount] = await new Slotmachine(message, wager, settings).run();
		const titles = message.language.get('commandSlotmachineTitles');

		return message.sendMessage(
			[`**${titles.previous}:** ${balance} ${Emojis.Shiny}`, `**${titles.new}:** ${amount} ${Emojis.Shiny}`].join('\n'),
			{ files: [{ attachment, name: 'slots.png' }] }
		);
	}
}
