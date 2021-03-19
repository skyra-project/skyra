import { DbSet } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { GuildMessage } from '#lib/types';
import { CanvasColors } from '#lib/types/Constants';
import { socialFolder } from '#utils/constants';
import { ApplyOptions } from '@sapphire/decorators';
import { Image, loadImage } from 'canvas';
import { Canvas } from 'canvas-constructor';
import { remove as removeConfusables } from 'confusables';
import type { User } from 'discord.js';
import { join } from 'path';

@ApplyOptions<SkyraCommand.Options>({
	cooldown: 10,
	description: LanguageKeys.Commands.Misc.ShipDescription,
	extendedHelp: LanguageKeys.Commands.Misc.ShipExtended,
	permissions: ['ATTACH_FILES'],
	runIn: ['news', 'text']
})
export class UserCommand extends SkyraCommand {
	private readonly kRemoveSymbolsRegex = /(?:[~`!@#%^&*(){}[\];:"'<,.>?/\\|_+=-])+/g;
	private lightThemeTemplate: Image = null!;
	private darkThemeTemplate: Image = null!;
	private heartIcon: Image = null!;

	public async run(message: GuildMessage, args: SkyraCommand.Args) {
		const firstUser = args.finished ? this.randomUser(message) : await args.pick('userName');
		const secondUser = args.finished ? this.randomUser(message, firstUser) : await args.pick('userName');

		// Get the avatars and sync the author's settings for dark mode preference
		const [avatarFirstUser, avatarSecondUser] = await Promise.all([this.fetchAvatar(firstUser), this.fetchAvatar(secondUser)]);

		const { users } = this.context.db;
		const settings = await users.ensureProfile(message.author.id);

		// Build up the ship canvas
		const attachment = await new Canvas(224, 88)
			// Add base image
			.printImage(settings.profile.darkTheme ? this.darkThemeTemplate : this.lightThemeTemplate, 0, 0, 224, 88)
			// Add avatar image with side-offsets of 12px, a Height x Width of 64x64px and bevel radius of 10
			.printRoundedImage(avatarFirstUser, 12, 12, 64, 64, 10)
			// Add heart icon with width offset of 84px and height offset of 20px
			.printImage(this.heartIcon, 84, 20)
			// Add avatar image with width offset of 148px, height offset of 12px, a Height x Width of 64x64px and bevel radius of 10
			.printRoundedImage(avatarSecondUser, 148, 12, 64, 64, 10)
			.toBufferAsync();

		// Return the lovely message
		const data = args.t(LanguageKeys.Commands.Misc.ShipData, {
			romeoUsername: firstUser.username,
			julietUsername: secondUser.username,
			shipName: this.getShipName([...firstUser.username], [...secondUser.username])
		});
		return message.send([data.title, data.description].join('\n'), { files: [{ attachment, name: 'ship.png' }] });
	}

	/** Initialize the light and dark theme templates and the heart icon */
	public async onLoad() {
		[this.lightThemeTemplate, this.darkThemeTemplate, this.heartIcon] = await Promise.all([
			new Canvas(224, 88).setColor(CanvasColors.BackgroundLight).printRoundedRectangle(0, 0, 224, 88, 10).toBufferAsync().then(loadImage),
			new Canvas(224, 88).setColor(CanvasColors.BackgroundDark).printRoundedRectangle(0, 0, 224, 88, 10).toBufferAsync().then(loadImage),
			loadImage(join(socialFolder, 'heart.png'))
		]);
	}

	/** Randomly pick a ship name for the two users */
	private getShipName(firstUsername: string[], secondUsername: string[]) {
		const randomizedFirstName = firstUsername.slice(0, Math.min(firstUsername.length, firstUsername.length * Math.random() * 0.8 + 2));
		const randomizedSecondName = secondUsername.slice(-Math.min(secondUsername.length, secondUsername.length * Math.random() * 0.8 + 2));
		// Remove any confusables from the name to make a cleaner ship name
		const deconfusedName = removeConfusables(randomizedFirstName.concat(randomizedSecondName).join(''));

		// Remove all symbols from the ship name
		const alphabeticalCharactersOnlyName = deconfusedName.replace(this.kRemoveSymbolsRegex, '');

		return alphabeticalCharactersOnlyName;
	}

	/**
	 * Fetches avatar as Buffer for a user
	 * @details Loosely based on fetchAvatar from utils, but customized for ship to account for not having a User object.
	 * @param user The user to fetch the avatar for
	 */
	private async fetchAvatar(user: User): Promise<Image> {
		try {
			return await loadImage(user.displayAvatarURL({ size: 64, format: 'png', dynamic: true }));
		} catch (error) {
			throw `Could not download the profile avatar: ${error.response}`;
		}
	}

	private randomUser(message: GuildMessage, firstUser?: User): User {
		// Prefer self if there is already a firstUser, that is not self
		if (firstUser !== undefined && firstUser.id !== message.author.id) return message.author;

		// Fetch 2 random IDs
		const users = message.guild!.members.cache.random(2);

		// If firstUser is already determined and the IDs match, then grab the second random ID
		if (firstUser !== undefined && firstUser.id === users[0].id) return users[1].user;

		// Else return the first random ID
		return users[0].user;
	}
}
