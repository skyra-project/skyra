import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { assetsFolder } from '#utils/constants';
import { sanitizeInput } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { send } from '@sapphire/plugin-editable-commands';
import { Canvas, Image, resolveImage } from 'canvas-constructor/skia';
import { PermissionFlagsBits } from 'discord-api-types/v9';
import type { Message } from 'discord.js';
import { join } from 'path';

@ApplyOptions<SkyraCommand.Options>({
	description: LanguageKeys.Commands.Misc.TheSearchDescription,
	detailedDescription: LanguageKeys.Commands.Misc.TheSearchExtended,
	requiredClientPermissions: [PermissionFlagsBits.AttachFiles],
	spam: true
})
export class UserCommand extends SkyraCommand {
	private kTemplate: Image = null!;

	public async messageRun(message: Message, args: SkyraCommand.Args) {
		const text = sanitizeInput(await args.rest('string'));
		const attachment = await this.generate(text);
		return send(message, { files: [{ attachment, name: 'TheSearch.png' }] });
	}

	public generate(text: string) {
		return new Canvas(700, 612)
			.printImage(this.kTemplate, 0, 0, 700, 612)
			.setTextAlign('center')
			.setTextFont('19px FamilyFriends')
			.createRectangleClip(61, 335, 156, 60)
			.printWrappedText(text, 143, 360, 156)
			.png();
	}

	public async onLoad() {
		this.kTemplate = await resolveImage(join(assetsFolder, './images/memes/TheSearch.png'));
	}
}
