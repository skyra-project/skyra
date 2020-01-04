import { MessageAttachment, MessageEmbed } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';
import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { UserSettings } from '@lib/types/settings/UserSettings';
import { Emojis } from '@util/constants';
import { Slotmachine } from '@util/Games/Slotmachine';
import { getColor } from '@util/util';

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['slot', 'slots', 'slotmachines'],
			bucket: 2,
			cooldown: 7,
			description: language => language.tget('COMMAND_SLOTMACHINE_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_SLOTMACHINE_EXTENDED'),
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

		const [image, amount] = await new Slotmachine(message, coins).run();

		return message.sendEmbed(this.buildEmbed(message, image, money, amount));
	}

	private buildEmbed(message: KlasaMessage, image: Buffer, money: number, amount: number) {
		const attachment = new MessageAttachment(image, 'slots.png');
		const TITLES = message.language.tget('COMMAND_SLOTMACHINE_EMBED_TITLES');

		return new MessageEmbed()
			.setColor(getColor(message))
			.attachFiles([attachment])
			.setTitle(TITLES.TITLE)
			.setImage('attachment://slots.png')
			.addField(`${TITLES.PREVIOUS} ${Emojis.Shiny}`, money, true)
			.addField(`${TITLES.NEW} ${Emojis.Shiny}`, amount, true);
	}

}
