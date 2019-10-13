import { Canvas } from 'canvas-constructor';
import { Image } from 'canvas';
import { Message } from 'discord.js';
import { join } from 'path';
import { assetsFolder } from '../../../Skyra';
import { ClientSettings } from '../../types/settings/ClientSettings';
import { UserSettings } from '../../types/settings/UserSettings';
import { loadImage } from '../util';

enum Icons {
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

	/**
	 * The amount bet
	 */
	public amount: number;

	/**
	 * The winnings
	 */
	public winnings = 0;

	/**
	 * The player
	 */
	public get player() {
		return this.message.author!;
	}

	/**
	 * The message that ran this instance
	 */
	public message: Message;

	public constructor(message: Message, amount: number) {
		this.message = message;
		this.amount = amount;
	}

	public get boost() {
		const userBoosts = this.player.client.settings!.get(ClientSettings.Boosts.Users);
		const guildBoosts = this.player.client.settings!.get(ClientSettings.Boosts.Guilds);
		return (this.message.guild && guildBoosts.includes(this.message.guild!.id) ? 1.5 : 1)
			* (userBoosts.includes(this.message.author!.id) ? 1.5 : 1);
	}

	public async run() {
		const { settings } = this.player;
		const rolls = this.roll();
		this.calculate(rolls);

		const money = settings.get(UserSettings.Money);
		const amount = this.winnings === 0 ? money - this.amount : money + (this.winnings * this.boost);
		if (amount < 0) throw 'You cannot have negative money.';
		await settings.update(UserSettings.Money, amount);
		return this.render(rolls);
	}

	public async render(rolls: readonly Icons[]) {
		const win = this.winnings > 0;
		const length = win ? 300 : 150;

		const canvas = new Canvas(length, 150)
			.save()
			.setShadowColor('rgba(51, 51, 51, 0.38)')
			.setShadowBlur(5)
			.setColor('#FFFFFF')
			.createBeveledClip(4, 4, length - 8, 142, 5)
			.fill()
			.restore()
			.save()
			.setColor(win ? '#00C853' : '#C62828')
			.setShadowColor(win ? 'rgba(64, 224, 15, 0.4)' : 'rgba(237, 29, 2, 0.4)')
			.setShadowBlur(4)
			.addRect(54, 54, 2, 38)
			.addRect(96, 54, 2, 38)
			.restore();

		await Promise.all(rolls.map((value, index) => new Promise(resolve => {
			const { x, y } = kAssets.get(value)!;
			const coord = kCoordinates[index];
			canvas.addImage(Slotmachine.images.ICON!, x, y, kIconSize, kIconSize, coord.x, coord.y, kIconSize, kIconSize);
			resolve();
		})));

		if (win) {
			canvas
				.setTextFont('30px RobotoLight')
				.setTextAlign('right')
				.addText('You won', 280, 60)
				.addText(this.winnings.toString(), 250, 100)
				.addImage(Slotmachine.images.SHINY!, 260, 68, 20, 39);
		}

		return canvas.toBufferAsync();
	}

	public calculate(roll: readonly Icons[]) {
		for (const [COMB1, COMB2, COMB3] of kCombinations) {
			if (roll[COMB1] === roll[COMB2] && roll[COMB2] === roll[COMB3]) {
				this.winnings += this.amount * kValues.get(roll[COMB1])!;
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

	public static images = Object.seal<SlotmachineAssets>({
		ICON: null,
		SHINY: null
	});

	public static async init(): Promise<void> {
		const [icon, shiny] = await Promise.all([
			loadImage(join(assetsFolder, 'images', 'social', 'sm-icons.png')),
			loadImage(join(assetsFolder, 'images', 'social', 'shiny-icon.png'))
		]);
		Slotmachine.images.ICON = icon;
		Slotmachine.images.SHINY = shiny;
	}

}

interface SlotmachineAssets {
	ICON: Image | null;
	SHINY: Image | null;
}
