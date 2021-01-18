import { DbSet } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures/commands/SkyraCommand';
import { floatPromise, resolveOnErrorCodes } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { RESTJSONErrorCodes } from 'discord-api-types/v6';
import type { Message, User } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	description: LanguageKeys.Commands.Social.DivorceDescription,
	extendedHelp: LanguageKeys.Commands.Social.DivorceExtended,
	requiredPermissions: ['ADD_REACTIONS', 'READ_MESSAGE_HISTORY'],
	usage: '<user:user>'
})
export default class extends SkyraCommand {
	public async run(message: Message, [user]: [User]) {
		const t = await message.fetchT();
		if (user === message.author) throw t(LanguageKeys.Commands.Social.DivorceSelf);

		const { users } = await DbSet.connect();
		return users.lock([message.author.id, user.id], async (authorID, targetID) => {
			const entry = await users.fetchSpouse(authorID, targetID);
			if (!entry) return message.sendTranslated(LanguageKeys.Commands.Social.DivorceNotTaken);

			// Ask the user if they're sure
			const accept = await message.ask(t(LanguageKeys.Commands.Social.DivorcePrompt));
			if (!accept) return message.sendTranslated(LanguageKeys.Commands.Social.DivorceCancel);

			// Remove the spouse
			await users.deleteSpouse(entry);

			// Tell the user about the divorce
			floatPromise(
				resolveOnErrorCodes(
					user.send(t(LanguageKeys.Commands.Social.DivorceDm, { user: message.author.username })),
					RESTJSONErrorCodes.CannotSendMessagesToThisUser
				)
			);
			return message.sendTranslated(LanguageKeys.Commands.Social.DivorceSuccess, [{ user: user.toString() }]);
		});
	}
}
