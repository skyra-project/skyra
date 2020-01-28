import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { UserSettings } from '@lib/types/settings/UserSettings';
import { Emojis } from '@utils/constants';
import { WheelOfFortune } from '@utils/Games/WheelOfFortune';
import { CommandStore, KlasaMessage } from 'klasa';

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['wof'],
			cooldown: 10,
			description: language => language.tget('COMMAND_WHEELOFFORTUNE_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_WHEELOFFORTUNE_EXTENDED'),
			requiredPermissions: ['ATTACH_FILES'],
			runIn: ['text'],
			usage: '<50|100|200|500|1000|2000|5000|10000>'
		});
	}

	public async run(message: KlasaMessage, [text]: [string]) {
		await message.author.settings.sync();
		const coins = Number(text);
		const money = message.author.settings.get(UserSettings.Money);
		if (money < coins) {
			throw message.language.tget('GAMES_NOT_ENOUGH_MONEY', money);
		}

		const [attachment, amount] = await new WheelOfFortune(message, coins).run();
		const TITLES = message.language.tget('COMMAND_WHEELOFFORTUNE_TITLES');

		return message.sendMessage([
			`**${TITLES.PREVIOUS}:** ${money} ${Emojis.Shiny}`,
			`**${TITLES.NEW}:** ${amount} ${Emojis.Shiny}`
		].join('\n'), { files: [{ attachment, name: 'wof.png' }] });
	}

}
