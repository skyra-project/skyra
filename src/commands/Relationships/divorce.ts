import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { floatPromise, resolveOnErrorCodes } from '#utils/common';
import { promptConfirmation } from '#utils/functions';
import { ApplyOptions } from '@sapphire/decorators';
import { send } from '@sapphire/plugin-editable-commands';
import { PermissionFlagsBits } from 'discord-api-types/payloads/v9';
import { RESTJSONErrorCodes } from 'discord-api-types/v9';
import type { Message } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	description: LanguageKeys.Commands.Social.DivorceDescription,
	extendedHelp: LanguageKeys.Commands.Social.DivorceExtended,
	requiredClientPermissions: [PermissionFlagsBits.AddReactions, PermissionFlagsBits.ReadMessageHistory]
})
export class UserCommand extends SkyraCommand {
	public async run(message: Message, args: SkyraCommand.Args) {
		const user = await args.pick('userName');
		if (user === message.author) this.error(LanguageKeys.Commands.Social.DivorceSelf);

		const { users } = this.container.db;
		return users.lock([message.author.id, user.id], async (authorId, targetId) => {
			const entry = await users.fetchSpouse(authorId, targetId);
			if (!entry) this.error(LanguageKeys.Commands.Social.DivorceNotTaken);

			// Ask the user if they're sure
			const accept = await promptConfirmation(message, args.t(LanguageKeys.Commands.Social.DivorcePrompt));
			if (!accept) this.error(LanguageKeys.Commands.Social.DivorceCancel);

			// Remove the spouse
			await users.deleteSpouse(entry);

			// Tell the user about the divorce
			floatPromise(
				resolveOnErrorCodes(
					user.send(args.t(LanguageKeys.Commands.Social.DivorceDm, { user: message.author.username })),
					RESTJSONErrorCodes.CannotSendMessagesToThisUser
				)
			);

			const content = args.t(LanguageKeys.Commands.Social.DivorceSuccess, { user: user.toString() });
			return send(message, content);
		});
	}
}
