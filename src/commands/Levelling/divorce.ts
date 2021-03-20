import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { floatPromise, resolveOnErrorCodes } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { RESTJSONErrorCodes } from 'discord-api-types/v6';
import type { Message } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	description: LanguageKeys.Commands.Social.DivorceDescription,
	extendedHelp: LanguageKeys.Commands.Social.DivorceExtended,
	permissions: ['ADD_REACTIONS', 'READ_MESSAGE_HISTORY']
})
export class UserCommand extends SkyraCommand {
	public async run(message: Message, args: SkyraCommand.Args) {
		const user = await args.pick('userName');
		if (user === message.author) this.error(LanguageKeys.Commands.Social.DivorceSelf);

		const { users } = this.context.db;
		return users.lock([message.author.id, user.id], async (authorID, targetID) => {
			const entry = await users.fetchSpouse(authorID, targetID);
			if (!entry) return message.send(args.t(LanguageKeys.Commands.Social.DivorceNotTaken));

			// Ask the user if they're sure
			const accept = await message.ask(args.t(LanguageKeys.Commands.Social.DivorcePrompt));
			if (!accept) return message.send(args.t(LanguageKeys.Commands.Social.DivorceCancel));

			// Remove the spouse
			await users.deleteSpouse(entry);

			// Tell the user about the divorce
			floatPromise(
				resolveOnErrorCodes(
					user.send(args.t(LanguageKeys.Commands.Social.DivorceDm, { user: message.author.username })),
					RESTJSONErrorCodes.CannotSendMessagesToThisUser
				)
			);
			return message.send(args.t(LanguageKeys.Commands.Social.DivorceSuccess, { user: user.toString() }));
		});
	}
}
