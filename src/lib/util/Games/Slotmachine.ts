import { UserEntity } from '@lib/database/entities/UserEntity';
import { DbSet } from '@lib/structures/DbSet';
import { CanvasColors } from '@lib/types/constants/Constants';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { socialFolder } from '@utils/constants';
import { Image, loadImage } from 'canvas';
import { Canvas } from 'canvas-constructor';
import { Message } from 'discord.js';
import { join } from 'path';

const enum Icons {
	Cherry,
	Bar,
	Lemon,
	Watermelon,
	Bells,
	Heart,
	Horseshoe,
	Diamond,
	Seven
}

interface Coordinate {
	x: number;
	y: number;
}

const kReels: readonly Icons[][] = [
	[8, 2, 1, 4, 5, 4, 3, 2, 2, 0, 2, 3, 7, 7, 0, 5, 2, 1, 5, 4, 7, 3, 6, 6, 7, 2, 4, 3, 1, 8, 0, 4, 5, 6, 6, 1, 2, 1, 4, 5, 0, 8, 6, 1, 3, 0, 1],
	[4, 1, 2, 2, 4, 3, 8, 2, 1, 6, 5, 2, 7, 0, 0, 6, 1, 4, 2, 1, 0, 2, 5, 5, 3, 6, 8, 7, 1, 1, 7, 4, 4, 3, 3, 0, 6, 1, 3, 5, 6, 0, 3, 0, 5, 6, 4],
	[3, 7, 1, 4, 2, 6, 5, 4, 1, 3, 0, 6, 1, 3, 4, 2, 1, 8, 1, 5, 2, 2, 7, 1, 4, 3, 4, 0, 7, 2, 2, 1, 0, 8, 4, 0, 6, 3, 5, 6, 8, 1, 8, 3, 4, 5, 7]
];
const kCombinations = [
	[0, 3, 6],
	[1, 4, 7],
	[2, 5, 8],
	[0, 4, 8],
	[2, 4, 6]
];
const kValues = new Map<Icons, number>([
	[Icons.Cherry, 4],
	[Icons.Bar, 4],
	[Icons.Lemon, 5],
	[Icons.Watermelon, 7],
	[Icons.Bells, 9],
	[Icons.Heart, 11],
	[Icons.Horseshoe, 14],
	[Icons.Diamond, 18],
	[Icons.Seven, 24]
]);

const kIconSize = 38;
const kAssets = new Map<Icons, Coordinate>([
	[Icons.Cherry, { x: kIconSize * 2, y: kIconSize * 2 }],
	[Icons.Bar, { x: kIconSize, y: kIconSize * 2 }],
	[Icons.Lemon, { x: 0, y: kIconSize * 2 }],
	[Icons.Watermelon, { x: kIconSize * 2, y: kIconSize }],
	[Icons.Bells, { x: kIconSize, y: kIconSize }],
	[Icons.Heart, { x: 0, y: kIconSize }],
	[Icons.Horseshoe, { x: kIconSize * 2, y: 0 }],
	[Icons.Diamond, { x: kIconSize, y: 0 }],
	[Icons.Seven, { x: 0, y: 0 }]
]);
const kCoordinates: readonly Coordinate[] = [
	{ x: 14, y: 14 },
	{ x: 14, y: 58 },
	{ x: 14, y: 102 },
	{ x: 58, y: 14 },
	{ x: 58, y: 58 },
	{ x: 58, y: 102 },
	{ x: 102, y: 14 },
	{ x: 102, y: 58 },
	{ x: 102, y: 102 }
];

const kPositions = [0, 0, 0];

export class Slotmachine {
	/** The amount bet */
	private bet: number;

	/** The winnings */
	private winnings = 0;

	/** The message that ran this instance */
	private message: Message;

	/** The player's settings */
	private settings: UserEntity;

	public constructor(message: Message, amount: number, settings: UserEntity) {
		this.message = message;
		this.bet = amount;
		this.settings = settings;
	}

	public async run() {
		const rolls = this.roll();
		this.calculate(rolls);

		const lost = this.winnings === 0;
		const winnings = this.winnings * (await this.fetchBoost()) - this.bet;
		const amount = lost ? this.settings.money - this.bet : this.settings.money + winnings;

		if (amount < 0) throw this.message.language.get(LanguageKeys.Commands.Games.GamesCannotHaveNegativeMoney);

		this.settings.money += lost ? -this.bet : winnings;
		await this.settings.save();

		return [await this.render(rolls, this.settings.profile!.darkTheme), amount] as [Buffer, number];
	}

	private async render(rolls: readonly Icons[], darkTheme: boolean) {
		const playerHasWon = this.winnings > 0;

		const canvas = new Canvas(300, 150)
			.setColor(darkTheme ? CanvasColors.BackgroundDark : CanvasColors.BackgroundLight)
			.printRoundedRectangle(5, 5, 295, 145, 10)
			.save()
			.setColor(playerHasWon ? CanvasColors.IndicatorGreen : CanvasColors.IndicatorRed)
			.setShadowColor(playerHasWon ? 'rgba(64, 224, 15, 0.4)' : 'rgba(237, 29, 2, 0.4)')
			.setShadowBlur(4)
			.printRectangle(53, 56, 2, 42)
			.printRectangle(99, 56, 2, 42)
			.restore()
			.save()
			.setColor(darkTheme ? CanvasColors.BackgroundLight : CanvasColors.BackgroundDark)
			.setTextFont('30px RobotoLight')
			.setTextAlign('right')
			.printText(
				this.message.language.get(
					playerHasWon ? LanguageKeys.Commands.Games.SlotmachineCanvasTextWon : LanguageKeys.Commands.Games.SlotmachineCanvasTextLost
				),
				280,
				60
			)
			.printText(playerHasWon ? (this.winnings - this.bet).toString() : (this.winnings + this.bet).toString(), 230, 100)
			.printImage(Slotmachine.images.SHINY!, 240, 68, 38, 39)
			.restore();

		await Promise.all(
			rolls.map(
				(value, index) =>
					new Promise((resolve) => {
						const { x, y } = kAssets.get(value)!;
						const coordinate = kCoordinates[index];
						canvas.printImage(Slotmachine.images.ICON!, x, y, kIconSize, kIconSize, coordinate.x, coordinate.y, kIconSize, kIconSize);
						resolve();
					})
			)
		);

		return canvas.toBufferAsync();
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

	private calculate(roll: readonly Icons[]) {
		for (const [COMB1, COMB2, COMB3] of kCombinations) {
			if (roll[COMB1] === roll[COMB2] && roll[COMB2] === roll[COMB3]) {
				this.winnings += this.bet * kValues.get(roll[COMB1])!;
			}
		}
	}

	private roll() {
		const roll: Icons[] = [];
		for (let i = 0; i < 3; i++) {
			const reel = kReels[i];
			const reelLength = reel.length;
			const rand = this._spinReel(i);
			roll.push(reel[rand === 0 ? reelLength - 1 : rand - 1], reel[rand], reel[rand === reelLength - 1 ? 0 : rand + 1]);
		}

		return roll as readonly Icons[];
	}

	private _spinReel(reel: number) {
		const kReelLength = kReels[reel].length;
		const position = (kPositions[reel] + Math.round(Math.random() * kReelLength + 3)) % kReelLength;
		kPositions[reel] = position;
		return position;
	}

	private static images: SlotmachineAssets = {
		ICON: null,
		SHINY: null
	};

	public static async init(): Promise<void> {
		const [icon, shiny] = await Promise.all([loadImage(join(socialFolder, 'sm-icons.png')), loadImage(join(socialFolder, 'shiny-icon.png'))]);
		Slotmachine.images.ICON = icon;
		Slotmachine.images.SHINY = shiny;
	}
}

interface SlotmachineAssets {
	ICON: Image | null;
	SHINY: Image | null;
}
