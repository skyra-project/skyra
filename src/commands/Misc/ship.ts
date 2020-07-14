import { DbSet } from '@lib/structures/DbSet';
import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { CanvasColors } from '@lib/types/constants/Constants';
import { KeyedMemberTag } from '@root/arguments/membername';
import { ApplyOptions, CreateResolvers } from '@skyra/decorators';
import { socialFolder } from '@utils/constants';
import { fetch, FetchResultTypes, getDisplayAvatar, loadImage } from '@utils/util';
import { Image } from 'canvas';
import { Canvas } from 'canvas-constructor';
import { remove as removeConfusables } from 'confusables';
import { KlasaMessage } from 'klasa';
import { join } from 'path';

@ApplyOptions<SkyraCommandOptions>({
	cooldown: 10,
	description: language => language.tget('COMMAND_SHIP_DESCRIPTION'),
	extendedHelp: language => language.tget('COMMAND_SHIP_EXTENDED'),
	requiredPermissions: ['ATTACH_FILES'],
	runIn: ['text'],
	usage: '(firstUser:user) (secondUser:user)',
	usageDelim: ' '
})
@CreateResolvers([
	[
		'user', (arg, possible, message, [firstUser]: KeyedMemberTag[]) => {
			if (!arg) {
				// Prefer self if there is already a firstUser, that is not self
				if (firstUser !== undefined && firstUser.id !== message.author.id) return { id: message.author.id };

				// Fetch 2 random IDs
				const ids = message.guild!.memberTags.randomKey(2)!;

				// If firstUser is already determined and the IDs match, then grab the second random ID
				if (firstUser !== undefined && firstUser.id === ids[0]) return { id: ids[1] };

				// Else return the first random ID
				return { id: ids[0] };
			}

			return message.client.arguments.get('membername')!.run(arg, possible, message);
		}
	]
])
export default class extends SkyraCommand {

	private readonly kRemoveSymbolsRegex = /(?:[~`!@#%^&*(){}[\];:"'<,.>?/\\|_+=-])+/g;
	private lightThemeTemplate: Buffer | null = null;
	private darkThemeTemplate: Buffer | null = null;
	private heartIcon: Image | null = null;

	public async run(message: KlasaMessage, [firstUser, secondUser]: [KeyedMemberTag, KeyedMemberTag]) {
		// We need the UserTags to resolve the avatar and username
		const [firstUserTag, secondUserTag] = await Promise.all([
			this.client.userTags.fetch(firstUser.id),
			this.client.userTags.fetch(secondUser.id)
		]);

		// Get the avatars and sync the author's settings for dark mode preference
		const [avatarFirstUser, avatarSecondUser] = await Promise.all([
			this.fetchAvatar(firstUser.id, firstUserTag, { size: 64 }),
			this.fetchAvatar(secondUser.id, secondUserTag, { size: 64 })
		]);

		const { users } = await DbSet.connect();
		const settings = await users.ensureProfile(message.author.id);

		// Build up the ship canvas
		const attachment = await new Canvas(224, 88)
			// Add base image
			.addImage(settings.profile.darkTheme ? this.darkThemeTemplate! : this.lightThemeTemplate!, 0, 0, 224, 88)
			// Add avatar image with side-offsets of 12px, a Height x Width of 64x64px and bevel radius of 10
			.addBeveledImage(avatarFirstUser, 12, 12, 64, 64, 10)
			// Add heart icon with width offset of 84px and height offset of 20px
			.addImage(this.heartIcon!, 84, 20)
			// Add avatar image with width offset of 148px, height offset of 12px, a Height x Width of 64x64px and bevel radius of 10
			.addBeveledImage(avatarSecondUser, 148, 12, 64, 64, 10)
			.toBufferAsync();

		// Return the lovely message
		const DATA = message.language.tget('COMMAND_SHIP_DATA');
		return message.sendMessage([
			DATA.TITLE(firstUserTag.username, secondUserTag.username),
			DATA.DESCRIPTION(this.getShipName([...firstUserTag.username], [...secondUserTag.username]))
		].join('\n'), { files: [{ attachment, name: 'ship.png' }] });
	}

	/** Initialize the light and dark theme templates and the heart icon */
	public async init() {
		[
			this.lightThemeTemplate,
			this.darkThemeTemplate,
			this.heartIcon
		] = await Promise.all([
			new Canvas(224, 88)
				.setColor(CanvasColors.BackgroundLight)
				.addBeveledRect(0, 0, 224, 88, 10)
				.toBufferAsync(),
			new Canvas(224, 88)
				.setColor(CanvasColors.BackgroundDark)
				.addBeveledRect(0, 0, 224, 88, 10)
				.toBufferAsync(),
			loadImage(join(socialFolder, 'heart.png'))
		]);
	}

	/** Randomly pick a ship name for the two users */
	private getShipName(firstUsername: string[], secondUsername: string[]) {
		const randomizedFirstName = firstUsername.slice(0, Math.min(firstUsername.length, (firstUsername.length * Math.random() * 0.8) + 2));
		const randomizedSecondName = secondUsername.slice(-Math.min(secondUsername.length, (secondUsername.length * Math.random() * 0.8) + 2));
		// Remove any confusables from the name to make a cleaner ship name
		const deconfusedName = removeConfusables(randomizedFirstName.concat(randomizedSecondName).join(''));
		// Remove all symbols from the ship name
		const alphabeticalCharactersOnlyName = deconfusedName.replace(this.kRemoveSymbolsRegex, '');

		return alphabeticalCharactersOnlyName;
	}

	/**
	 * Fetches avatar as Buffer for a user
	 * @details Losely based on fetchAvatar from utils, but customized for ship to account for not having a User object.
	 * @param args The args to pass to getDisplayAvatar util function. Argument types match exactly.
	 */
	private async fetchAvatar(...args: Parameters<typeof getDisplayAvatar>): Promise<Buffer> {
		const url = getDisplayAvatar(...args);
		try {
			return await fetch(url, FetchResultTypes.Buffer);
		} catch (error) {
			throw `Could not download the profile avatar: ${error}`;
		}
	}

}
