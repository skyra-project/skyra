import { Canvas } from 'canvas-constructor';
import { Message, User } from 'discord.js';
import { join } from 'path';
import { assetsFolder } from '../../../Skyra';
import { ClientSettings } from '../../types/settings/ClientSettings';
import { UserSettings } from '../../types/settings/UserSettings';
import { loadImage } from '../util';

const REELS = [
	[8, 2, 1, 4, 5, 4, 3, 2, 2, 0, 2, 3, 7, 7, 0, 5, 2, 1, 5, 4, 7, 3, 6, 6, 7, 2, 4, 3, 1, 8, 0, 4, 5, 6, 6, 1, 2, 1, 4, 5, 0, 8, 6, 1, 3, 0, 1],
	[4, 1, 2, 2, 4, 3, 8, 2, 1, 6, 5, 2, 7, 0, 0, 6, 1, 4, 2, 1, 0, 2, 5, 5, 3, 6, 8, 7, 1, 1, 7, 4, 4, 3, 3, 0, 6, 1, 3, 5, 6, 0, 3, 0, 5, 6, 4],
	[3, 7, 1, 4, 2, 6, 5, 4, 1, 3, 0, 6, 1, 3, 4, 2, 1, 8, 1, 5, 2, 2, 7, 1, 4, 3, 4, 0, 7, 2, 2, 1, 0, 8, 4, 0, 6, 3, 5, 6, 8, 1, 8, 3, 4, 5, 7]
];
const COMBINATIONS = [[0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
const VALUES = [4, 4, 5, 7, 9, 11, 14, 18, 24];

const ICON_SIZE = 38;
const ASSETS = [
	{ x: ICON_SIZE * 2, y: ICON_SIZE * 2 },
	{ x: ICON_SIZE, y: ICON_SIZE * 2 },
	{ x: 0, y: ICON_SIZE * 2 },
	{ x: ICON_SIZE * 2, y: ICON_SIZE },
	{ x: ICON_SIZE, y: ICON_SIZE },
	{ x: 0, y: ICON_SIZE },
	{ x: ICON_SIZE * 2, y: 0 },
	{ x: ICON_SIZE, y: 0 },
	{ x: 0, y: 0 }
];
const COORDINATES = [
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

const POSITIONS = [0, 0, 0];

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
	public get player(): User {
		return this.message.author;
	}

	public get boost(): number {
		const userBoosts = this.player.client.settings.get(ClientSettings.Boosts.Users) as ClientSettings.Boosts.Users;
		const guildBoosts = this.player.client.settings.get(ClientSettings.Boosts.Guilds) as ClientSettings.Boosts.Guilds;
		return (this.message.guild && guildBoosts.includes(this.message.guild.id) ? 1.5 : 1)
			* (userBoosts.includes(this.message.author.id) ? 1.5 : 1);
	}

	public constructor(public message: Message, amount: number) {
		this.amount = amount;
	}

	public async run(): Promise<Buffer> {
		const { settings } = this.player;
		const rolls = this.roll();
		this.calculate(rolls);

		const money = settings.get(UserSettings.Money) as UserSettings.Money;
		const amount = this.winnings !== 0 ? money + (this.winnings * this.boost) : money - this.amount;
		if (amount < 0) throw 'You cannot have negative money.';
		await settings.update('money', amount);
		return this.render(rolls);
	}

	public async render(rolls: number[]): Promise<Buffer> {
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

		// tslint:disable-next-line:no-floating-promises
		await Promise.all(rolls.map((value, index) => new Promise<void>((res) => {
			const { x, y } = ASSETS[value];
			const coord = COORDINATES[index];
			// @ts-ignore
			canvas.context.drawImage(Slotmachine.images.ICON, x, y, ICON_SIZE, ICON_SIZE, coord.x, coord.y, ICON_SIZE, ICON_SIZE);
			res();
		})));

		if (win) {
			canvas
				.setTextFont('30px RobotoLight')
				.setTextAlign('right')
				.addText('You won', 280, 60)
				.addText(this.winnings.toString(), 250, 100)
				.addImage(Slotmachine.images.SHINY, 260, 68, 20, 39);
		}

		return canvas.toBufferAsync();
	}

	public calculate(roll: number[]): void {
		for (const [COMB1, COMB2, COMB3] of COMBINATIONS) {
			if (roll[COMB1] === roll[COMB2] && roll[COMB2] === roll[COMB3])
				this.winnings += this.amount * VALUES[roll[COMB1]];
		}
	}

	public roll(): number[] {
		const roll = [];
		for (let i = 0; i < 3; i++) {
			const reel = REELS[i];
			const reelLength = reel.length;
			const rand = this._spinReel(i);
			roll.push(
				reel[rand === 0 ? reelLength - 1 : rand - 1],
				reel[rand],
				reel[rand === reelLength - 1 ? 0 : rand + 1]);
		}

		return roll;
	}

	public _spinReel(reel: number): number {
		const REEL_LENGTH = REELS[reel].length;
		const position = (POSITIONS[reel] + Math.round((Math.random() * REEL_LENGTH) + 3)) % REEL_LENGTH;
		POSITIONS[reel] = position;
		return position;
	}

	public static images = Object.seal({
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
