import { ClientSettings } from '@lib/types/settings/ClientSettings';
import { UserSettings } from '@lib/types/settings/UserSettings';
import { socialFolder } from '@utils/constants';
import { loadImage } from '@utils/util';
import { Image } from 'canvas';
import { Canvas } from 'canvas-constructor';
import { Message } from 'discord.js';
import { join } from 'path';
import { EconomyTransactionReason } from '@lib/types/influxSchema/Economy';

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
const kCombinations = [[0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
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
	{ x: 14, y: 12 },
	{ x: 14, y: 54 },
	{ x: 14, y: 96 },
	{ x: 56, y: 12 },
	{ x: 56, y: 54 },
	{ x: 56, y: 96 },
	{ x: 98, y: 12 },
	{ x: 98, y: 54 },
	{ x: 98, y: 96 }
];

const kPositions = [0, 0, 0];

export class Slotmachine {

	/** The amount bet */
	public bet: number;

	/** The winnings */
	public winnings = 0;

	/** The player */
	public get player() {
		return this.message.author;
	}

	/** The message that ran this instance */
	public message: Message;

	public constructor(message: Message, amount: number) {
		this.message = message;
		this.bet = amount;
	}

	public get boost() {
		const userBoosts = this.player.client.settings!.get(ClientSettings.Boosts.Users);
		const guildBoosts = this.player.client.settings!.get(ClientSettings.Boosts.Guilds);
		return (this.message.guild && guildBoosts.includes(this.message.guild.id) ? 1.5 : 1)
			* (userBoosts.includes(this.message.author.id) ? 1.5 : 1);
	}

	public async run() {
		const { settings } = this.player;
		const rolls = this.roll();
		this.calculate(rolls);

		const money = settings.get(UserSettings.Money);
		const lost = this.winnings === 0;
		const winnings = (this.winnings * this.boost) - this.bet;
		const darkTheme = settings.get(UserSettings.DarkTheme);
		const amount = lost
			? money - this.bet
			: money + winnings;

		if (amount < 0) throw this.message.language.tget('GAMES_CANNOT_HAVE_NEGATIVE_MONEY');

		await (lost
			? this.player.decreaseBalance(this.bet, EconomyTransactionReason.Gamble)
			: this.player.increaseBalance(winnings, EconomyTransactionReason.Gamble));

		return [await this.render(rolls, darkTheme), amount] as [Buffer, number];
	}

	public async render(rolls: readonly Icons[], darkTheme: boolean) {
		const playerHasWon = this.winnings > 0;

		const canvas = new Canvas(300, 150)
			.save()
			.setShadowColor('rgba(51, 51, 51, 0.38)')
			.setShadowBlur(5)
			.setColor(darkTheme ? Slotmachine.DARK_COLOUR : Slotmachine.LIGHT_COLOUR)
			.createBeveledClip(4, 4, 300 - 8, 142, 5)
			.fill()
			.restore()
			.save()
			.setColor(playerHasWon ? Slotmachine.SUCCESS_COLOUR : Slotmachine.FAIL_COLOUR)
			.setShadowColor(playerHasWon ? 'rgba(64, 224, 15, 0.4)' : 'rgba(237, 29, 2, 0.4)')
			.setShadowBlur(4)
			.addRect(54, 54, 2, 38)
			.addRect(96, 54, 2, 38)
			.restore()
			.save()
			.setColor(darkTheme ? Slotmachine.LIGHT_COLOUR : Slotmachine.DARK_COLOUR)
			.setTextFont('30px RobotoLight')
			.setTextAlign('right')
			.addText(this.message.language.tget('COMMAND_SLOTMACHINE_CANVAS_TEXT', playerHasWon), 280, 60)
			.addText(playerHasWon ? (this.winnings - this.bet).toString() : (this.winnings + this.bet).toString(), 230, 100)
			.addImage(Slotmachine.images.SHINY!, 240, 68, 38, 39)
			.restore();

		await Promise.all(rolls.map((value, index) => new Promise(resolve => {
			const { x, y } = kAssets.get(value)!;
			const coordinate = kCoordinates[index];
			canvas.addImage(Slotmachine.images.ICON!, x, y, kIconSize, kIconSize, coordinate.x, coordinate.y, kIconSize, kIconSize);
			resolve();
		})));

		return canvas.toBufferAsync();
	}

	public calculate(roll: readonly Icons[]) {
		for (const [COMB1, COMB2, COMB3] of kCombinations) {
			if (roll[COMB1] === roll[COMB2] && roll[COMB2] === roll[COMB3]) {
				this.winnings += this.bet * kValues.get(roll[COMB1])!;
			}
		}
	}

	public roll() {
		const roll: Icons[] = [];
		for (let i = 0; i < 3; i++) {
			const reel = kReels[i];
			const reelLength = reel.length;
			const rand = this._spinReel(i);
			roll.push(
				reel[rand === 0 ? reelLength - 1 : rand - 1],
				reel[rand],
				reel[rand === reelLength - 1 ? 0 : rand + 1]
			);
		}

		return roll as readonly Icons[];
	}

	public _spinReel(reel: number) {
		const kReelLength = kReels[reel].length;
		const position = (kPositions[reel] + Math.round((Math.random() * kReelLength) + 3)) % kReelLength;
		kPositions[reel] = position;
		return position;
	}

	/** Dark colour in the attachment */
	public static DARK_COLOUR = '#202225';

	/** Light colour in the attachment */
	public static LIGHT_COLOUR = '#FFFFFF';

	/** Success colour in the attachment */
	public static SUCCESS_COLOUR = '#00C853';

	/** Failure colour in the attachment */
	public static FAIL_COLOUR = '#C62828';

	public static images = Object.seal<SlotmachineAssets>({
		ICON: null,
		SHINY: null
	});

	public static async init(): Promise<void> {
		const [icon, shiny] = await Promise.all([
			loadImage(join(socialFolder, 'sm-icons.png')),
			loadImage(join(socialFolder, 'shiny-icon.png'))
		]);
		Slotmachine.images.ICON = icon;
		Slotmachine.images.SHINY = shiny;
	}

}

interface SlotmachineAssets {
	ICON: Image | null;
	SHINY: Image | null;
}
