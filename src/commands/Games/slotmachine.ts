import { DbSet } from '#lib/database';
import { SkyraCommand, SkyraCommandOptions } from '#lib/structures/SkyraCommand';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { Slotmachine } from '#utils/Games/Slotmachine';
import { ApplyOptions } from '@skyra/decorators';
import { KlasaMessage } from 'klasa';

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['slot', 'slots', 'slotmachines'],
	bucket: 2,
	cooldown: 7,
	description: LanguageKeys.Commands.Games.SlotMachineDescription,
	extendedHelp: LanguageKeys.Commands.Games.SlotMachineExtended,
	requiredPermissions: ['ATTACH_FILES'],
	usage: '<wager:wager>'
})
export default class extends SkyraCommand {
	public async run(message: KlasaMessage, [wager]: [number]) {
		const t = await message.fetchT();
		const { users } = await DbSet.connect();
		const settings = await users.ensureProfile(message.author.id);
		const balance = settings.money;
		if (balance < wager) {
			throw t(LanguageKeys.Commands.Games.GamesNotEnoughMoney, { money: balance });
		}

		const [attachment, amount] = await new Slotmachine(message, wager, settings).run();
		return message.send(t(LanguageKeys.Commands.Games.BalanceDifference, { previous: balance, next: amount }), {
			files: [{ attachment, name: 'slots.png' }]
		});
	}
}
