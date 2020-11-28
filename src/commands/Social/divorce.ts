import { DbSet } from '#lib/database/index';
import { SkyraCommand, SkyraCommandOptions } from '#lib/structures/SkyraCommand';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { floatPromise, resolveOnErrorCodes } from '#utils/util';
import { ApplyOptions } from '@skyra/decorators';
import { RESTJSONErrorCodes } from 'discord-api-types/v6';
import { User } from 'discord.js';
import { KlasaMessage } from 'klasa';

@ApplyOptions<SkyraCommandOptions>({
	description: (language) => language.get(LanguageKeys.Commands.Social.DivorceDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Social.DivorceExtended),
	requiredPermissions: ['ADD_REACTIONS', 'READ_MESSAGE_HISTORY'],
	usage: '<user:user>'
})
export default class extends SkyraCommand {
	public async run(message: KlasaMessage, [user]: [User]) {
		const language = await message.fetchLanguage();
		if (user === message.author) throw language.get(LanguageKeys.Commands.Social.DivorceSelf);

		const { users } = await DbSet.connect();
		return users.lock([message.author.id, user.id], async (authorID, targetID) => {
			const entry = await users.fetchSpouse(authorID, targetID);
			if (!entry) return message.sendLocale(LanguageKeys.Commands.Social.DivorceNotTaken);

			// Ask the user if they're sure
			const accept = await message.ask(language.get(LanguageKeys.Commands.Social.DivorcePrompt));
			if (!accept) return message.sendLocale(LanguageKeys.Commands.Social.DivorceCancel);

			// Remove the spouse
			await users.deleteSpouse(entry);

			// Tell the user about the divorce
			floatPromise(
				this,
				resolveOnErrorCodes(
					user.send(language.get(LanguageKeys.Commands.Social.DivorceDm, { user: message.author.username })),
					RESTJSONErrorCodes.CannotSendMessagesToThisUser
				)
			);
			return message.sendLocale(LanguageKeys.Commands.Social.DivorceSuccess, [{ user: user.toString() }]);
		});
	}
}
