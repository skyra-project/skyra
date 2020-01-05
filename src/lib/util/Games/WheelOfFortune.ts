import Collection from '@discordjs/collection';
import { ClientSettings } from '@lib/types/settings/ClientSettings';
import { UserSettings } from '@lib/types/settings/UserSettings';
import { socialFolder } from '@utils/constants';
import { loadImage } from '@utils/util';
import { Image } from 'canvas';
import { Canvas } from 'canvas-constructor';
import { Message } from 'discord.js';
import { join } from 'path';
import { Slotmachine } from './Slotmachine';

const enum Icons {
	LOSS_0_1,
	LOSS_0_2,
	LOSS_0_3,
	LOSS_0_5,
	WIN_1_2,
	WIN_1_5,
	WIN_1_7,
	WIN_2_4,
}

const enum Arrows {
	UP_DIAGONAL_LEFT,
	UP,
	UP_DIAGONAL_RIGHT,
	RIGHT,
	LEFT,
	DOWN_DIAGONAL_LEFT,
	DOWN,
	DOWN_DIAGONAL_RIGHT
}

interface Coordinate {
	x: number;
	y: number;
}

const kIconSize = 38;
const kArrowSize = 36;
const kAssets = new Collection<Icons, Coordinate>([
	[Icons.WIN_1_5, { x: kIconSize * 2, y: kIconSize * 2 }],
	[Icons.WIN_1_2, { x: kIconSize, y: kIconSize * 2 }],
	[Icons.LOSS_0_5, { x: 0, y: kIconSize * 2 }],
	[Icons.WIN_1_7, { x: kIconSize * 2, y: kIconSize }],
	[Icons.LOSS_0_3, { x: 0, y: kIconSize }],
	[Icons.WIN_2_4, { x: kIconSize * 2, y: 0 }],
	[Icons.LOSS_0_1, { x: kIconSize, y: 0 }],
	[Icons.LOSS_0_2, { x: 0, y: 0 }]
]);
const kArrows = new Map<Arrows, Coordinate>([
	[Arrows.DOWN_DIAGONAL_RIGHT, { x: kArrowSize * 2, y: kArrowSize * 2 }],
	[Arrows.DOWN, { x: kArrowSize, y: kArrowSize * 2 }],
	[Arrows.DOWN_DIAGONAL_LEFT, { x: 0, y: kArrowSize * 2 }],
	[Arrows.RIGHT, { x: kArrowSize * 2, y: kArrowSize }],
	[Arrows.LEFT, { x: 0, y: kArrowSize }],
	[Arrows.UP_DIAGONAL_RIGHT, { x: kArrowSize * 2, y: 0 }],
	[Arrows.UP, { x: kArrowSize, y: 0 }],
	[Arrows.UP_DIAGONAL_LEFT, { x: 0, y: 0 }]
]);

export class WheelOfFortune {

	/** The amount bet */
	public amount: number;

	/** The winnings */
	public winnings = 0;

	/** The message that ran this instance */
	public message: Message;

	/** The Wheel of Fortune multipliers */
	private MULTIPLIERS = [1.5, 1.2, 0.5, 1.7, 0.3, 2.4, 0.1, 0.2];

	/** The player */
	public get player() {
		return this.message.author;
	}

	public constructor(message: Message, amount: number) {
		this.message = message;
		this.amount = amount;
	}

	public get boost() {
		const userBoosts = this.player.client.settings!.get(ClientSettings.Boosts.Users);
		const guildBoosts = this.player.client.settings!.get(ClientSettings.Boosts.Guilds);
		return (this.message.guild && guildBoosts.includes(this.message.guild.id) ? 1.5 : 1)
			* (userBoosts.includes(this.message.author.id) ? 1.5 : 1);
	}

	public async run() {
		const { settings } = this.player;
		const money = settings.get(UserSettings.Money);
		const darkTheme = settings.get(UserSettings.DarkTheme);
		const spin = Math.floor(Math.random() * this.MULTIPLIERS.length);
		this.calculate(spin);

		const amount = this.winnings === 0 ? money - this.amount : money - this.amount + (this.winnings * this.boost);
		if (amount < 0) throw this.message.language.tget('GAMES_CANNOT_HAVE_NEGATIVE_MONEY');
		await settings.update(UserSettings.Money, amount);

		return [await this.render(money, spin, amount, darkTheme), amount] as [Buffer, number];
	}

	private calculate(spin: number) {
		// The multiplier to apply
		const multiplier = this.MULTIPLIERS[spin];

		// The winnings
		this.winnings += this.amount * multiplier;
	}

	private async render(money: number, spin: number, amount: number, darkTheme: boolean): Promise<Buffer> {
		const playerHasWon = amount > money;

		const { x: arrowX, y: arrowY } = this.getArrow(kArrows.values(), spin)!;

		const canvas = new Canvas(300, 132)
			.save()
			.setShadowColor('rgba(51, 51, 51, 0.38)')
			.setShadowBlur(5)
			.setColor(darkTheme ? Slotmachine.DARK_COLOUR : Slotmachine.LIGHT_COLOUR)
			.createBeveledClip(4, 4, 300 - 8, 142, 5)
			.fill()
			.restore()
			.save()
			.setColor(darkTheme ? Slotmachine.LIGHT_COLOUR : Slotmachine.DARK_COLOUR)
			.setTextFont('30px RobotoLight')
			.setTextAlign('right')
			.addText(this.message.language.tget('COMMAND_WHEELOFFORTUNE_CANVAS_TEXT', playerHasWon), 280, 60)
			.addText(playerHasWon ? (this.winnings - this.amount).toString() : (this.winnings + this.amount).toString(), 230, 100)
			.addImage(WheelOfFortune.images.SHINY!, 240, 68, 38, 39)
			.addImage(WheelOfFortune.images.ARROWS!, arrowX, arrowY, kArrowSize, kArrowSize, kIconSize + 12, kIconSize + 12, kIconSize, kIconSize)
			.restore();

		await Promise.all(kAssets.map(value => new Promise(resolve => {
			const { x, y } = value;
			canvas.addImage(
				playerHasWon ? WheelOfFortune.images.WIN_ICONS! : WheelOfFortune.images.LOSE_ICONS!,
				x, y, kIconSize, kIconSize, x + 12, y + 12, kIconSize, kIconSize
			);
			resolve();
		})));

		return canvas.toBufferAsync();
	}

	private getArrow(iterable: IterableIterator<Coordinate>, n: number) {
		let index = 0;
		for (const arrow of iterable) {
			if (index === n) {
				return arrow;
			}
			index++;
		}
		return null;
	}

	public static images = Object.seal<WheelOfFortuneAssets>({
		LOSE_ICONS: null,
		WIN_ICONS: null,
		ARROWS: null,
		SHINY: null
	});

	public static async init(): Promise<void> {
		const [winIcons, loseIcons, arrows, shiny] = await Promise.all([
			loadImage(join(socialFolder, 'wof-win-icons.png')),
			loadImage(join(socialFolder, 'wof-lose-icons.png')),
			loadImage(join(socialFolder, 'wof-arrows.png')),
			loadImage(join(socialFolder, 'shiny-icon.png'))
		]);

		WheelOfFortune.images.LOSE_ICONS = loseIcons;
		WheelOfFortune.images.WIN_ICONS = winIcons;
		WheelOfFortune.images.ARROWS = arrows;
		WheelOfFortune.images.SHINY = shiny;
	}

}

interface WheelOfFortuneAssets {
	LOSE_ICONS: Image | null;
	WIN_ICONS: Image | null;
	ARROWS: Image | null;
	SHINY: Image | null;
}
