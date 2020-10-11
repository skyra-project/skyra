import { UserEntity } from '@lib/database/entities/UserEntity';
import { DbSet } from '@lib/structures/DbSet';
import { CanvasColors } from '@lib/types/constants/Constants';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { roundNumber } from '@sapphire/utilities';
import { socialFolder } from '@utils/constants';
import { Image, loadImage } from 'canvas';
import { Canvas } from 'canvas-constructor';
import { Message } from 'discord.js';
import { join } from 'path';

const enum Arrows {
	UpDiagonalLeft = 0.2,
	Up = 0.1,
	UpDiagonalRight = 2.4,
	Left = 0.3,
	Right = 1.7,
	DownDiagonalLeft = 0.5,
	Down = 1.2,
	DownDiagonalRight = 1.5
}

interface Coordinate {
	x: number;
	y: number;
}

const kIconSize = 38;
const kAssets: Coordinate[] = [
	{ x: kIconSize * 2, y: kIconSize * 2 },
	{ x: kIconSize, y: kIconSize * 2 },
	{ x: 0, y: kIconSize * 2 },
	{ x: kIconSize * 2, y: kIconSize },
	{ x: 0, y: kIconSize },
	{ x: kIconSize * 2, y: 0 },
	{ x: kIconSize, y: 0 },
	{ x: 0, y: 0 }
];

const kArrowSize = 36;
const kArrows = new Map<Arrows, Coordinate>([
	[Arrows.UpDiagonalLeft, { x: 0, y: 0 }],
	[Arrows.Up, { x: kArrowSize, y: 0 }],
	[Arrows.UpDiagonalRight, { x: kArrowSize * 2, y: 0 }],
	[Arrows.Left, { x: 0, y: kArrowSize }],
	[Arrows.Right, { x: kArrowSize * 2, y: kArrowSize }],
	[Arrows.DownDiagonalLeft, { x: 0, y: kArrowSize * 2 }],
	[Arrows.Down, { x: kArrowSize, y: kArrowSize * 2 }],
	[Arrows.DownDiagonalRight, { x: kArrowSize * 2, y: kArrowSize * 2 }]
]);

export class WheelOfFortune {
	/** The amount bet */
	public amount: number;

	/** The spin result */
	public spin = -1;

	/** The winnings, negative if the user has lost */
	public winnings = 0;

	/** The message that ran this instance */
	public message: Message;

	/** The player's settings */
	public settings: UserEntity;

	/** The player */
	public get player() {
		return this.message.author;
	}

	public constructor(message: Message, amount: number, settings: UserEntity) {
		this.message = message;
		this.amount = amount;
		this.settings = settings;
	}

	public async run() {
		await this.calculate();

		const lost = this.winnings < 0;
		const final = this.settings.money + this.winnings;
		if (lost && final < 0) {
			throw this.message.language.get(LanguageKeys.Commands.Games.GamesCannotHaveNegativeMoney);
		}

		this.settings.money += this.winnings;
		await this.settings.save();

		return [await this.render(this.settings.profile!.darkTheme), final] as const;
	}

	/** The boost */
	private async fetchBoost() {
		const { clients } = await DbSet.connect();
		const settings = await clients.ensure();

		return (
			(this.message.guild && settings.guildBoost.includes(this.message.guild.id) ? 1.5 : 1) *
			(settings.userBoost.includes(this.message.author.id) ? 1.5 : 1)
		);
	}

	private async calculate() {
		this.spin = Math.floor(Math.random() * WheelOfFortune.kMultipliers.length);

		// The multiplier to apply
		const multiplier = WheelOfFortune.kMultipliers[this.spin];

		// The winnings
		this.winnings = roundNumber(
			multiplier >= 1 ? this.amount * multiplier * (await this.fetchBoost()) - this.amount : this.amount * multiplier - this.amount
		);
	}

	private async render(darkTheme: boolean): Promise<Buffer> {
		const playerHasWon = this.winnings > 0;

		const { x: arrowX, y: arrowY } = kArrows.get(WheelOfFortune.kMultipliers[this.spin])!;

		const canvas = new Canvas(300, 132)
			.setColor(darkTheme ? CanvasColors.BackgroundDark : CanvasColors.BackgroundLight)
			.printRoundedRectangle(5, 5, 295, 127, 10)
			.save()
			.setColor(darkTheme ? CanvasColors.BackgroundLight : CanvasColors.BackgroundDark)
			.setTextFont('30px RobotoLight')
			.setTextAlign('right')
			.printText(
				this.message.language.get(
					playerHasWon ? LanguageKeys.Commands.Games.WheelOfFortuneCanvasTextWon : LanguageKeys.Commands.Games.WheelOfFortuneCanvasTextLost
				),
				280,
				60
			)
			.printText((playerHasWon ? this.winnings : -this.winnings).toString(), 230, 100)
			.printImage(WheelOfFortune.images.SHINY!, 240, 68, 38, 39)
			.printImage(WheelOfFortune.images.ARROWS!, arrowX, arrowY, kArrowSize, kArrowSize, kIconSize + 12, kIconSize + 12, kIconSize, kIconSize)
			.restore();

		const image = playerHasWon ? WheelOfFortune.images.WIN_ICONS! : WheelOfFortune.images.LOSE_ICONS!;
		await Promise.all(
			kAssets.map(
				({ x, y }) =>
					new Promise((resolve) => {
						canvas.printImage(image, x, y, kIconSize, kIconSize, x + 12, y + 12, kIconSize, kIconSize);
						resolve();
					})
			)
		);

		return canvas.toBufferAsync();
	}

	/** The Wheel of Fortune multipliers */
	private static kMultipliers = [
		Arrows.UpDiagonalLeft,
		Arrows.Up,
		Arrows.UpDiagonalRight,
		Arrows.Right,
		Arrows.Left,
		Arrows.DownDiagonalLeft,
		Arrows.Down,
		Arrows.DownDiagonalRight
	];

	private static images: WheelOfFortuneAssets = {
		LOSE_ICONS: null,
		WIN_ICONS: null,
		ARROWS: null,
		SHINY: null
	};

	public static async init() {
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
