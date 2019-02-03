import { CommandStore, KlasaClient, KlasaMessage } from 'klasa';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { UserSettings } from '../../lib/types/namespaces/UserSettings';
import { Slotmachine } from '../../lib/util/Games/Slotmachine';

export default class extends SkyraCommand {

	public constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			aliases: ['slot', 'slots', 'slotmachines'],
			bucket: 2,
			cooldown: 10,
			description: (language) => language.get('COMMAND_SLOTMACHINE_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_SLOTMACHINE_EXTENDED'),
			requiredPermissions: ['ATTACH_FILES'],
			runIn: ['text'],
			usage: '<50|100|200|500|1000|2000|5000|10000>'
		});
	}

	public async run(message: KlasaMessage, [text]: [string]) {
		await message.author.settings.sync();
		const coins = Number(text);
		const money = message.author.settings.get(UserSettings.Money) as UserSettings.Money;
		if (money < coins)
			throw message.language.get('COMMAND_SLOTMACHINES_MONEY', money);

		const attachment = await new Slotmachine(message, coins).run();
		return message.channel.send({ files: [{ attachment, name: 'Slotmachine.png' }] });
	}

}
