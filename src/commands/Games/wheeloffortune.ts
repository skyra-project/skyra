import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { UserSettings } from '@lib/types/settings/UserSettings';
import { Emojis } from '@utils/constants';
import { WheelOfFortune } from '@utils/Games/WheelOfFortune';
import { getColor } from '@utils/util';
import { MessageAttachment, MessageEmbed } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['wof'],
			cooldown: 10,
			description: language => language.tget('COMMAND_WHEELOFFORTUNE_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_WHEELOFFORTUNE_EXTENDED'),
			requiredPermissions: ['EMBED_LINKS', 'ATTACH_FILES'],
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

		const [image, amount] = await new WheelOfFortune(message, coins).run();

		return message.sendEmbed(this.buildEmbed(message, image, money, amount));
	}

	private buildEmbed(message: KlasaMessage, image: Buffer, money: number, amount: number) {
		const attachment = new MessageAttachment(image, 'wof.png');
		const TITLES = message.language.tget('COMMAND_WHEELOFFORTUNE_EMBED_TITLES');

		return new MessageEmbed()
			.setColor(getColor(message))
			.attachFiles([attachment])
			.setTitle(TITLES.TITLE)
			.setImage('attachment://wof.png')
			.addField(`${TITLES.PREVIOUS} ${Emojis.Shiny}`, money, true)
			.addField(`${TITLES.NEW} ${Emojis.Shiny}`, amount, true);
	}

}
