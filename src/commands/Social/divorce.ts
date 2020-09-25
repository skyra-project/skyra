import { DbSet } from '@lib/structures/DbSet';
import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { ApplyOptions } from '@skyra/decorators';
import { floatPromise, resolveOnErrorCodes } from '@utils/util';
import { RESTJSONErrorCodes } from 'discord-api-types/v6';
import { User } from 'discord.js';
import { KlasaMessage } from 'klasa';

@ApplyOptions<SkyraCommandOptions>({
	description: (language) => language.get('commandDivorceDescription'),
	extendedHelp: (language) => language.get('commandDivorceExtended'),
	requiredPermissions: ['ADD_REACTIONS', 'READ_MESSAGE_HISTORY'],
	runIn: ['text'],
	usage: '<user:user>'
})
export default class extends SkyraCommand {
	public async run(message: KlasaMessage, [user]: [User]) {
		if (user === message.author) throw message.language.get('commandDivorceSelf');

		const { users } = await DbSet.connect();
		return users.lock([message.author.id, user.id], async (authorID, targetID) => {
			const entry = await users.fetchSpouse(authorID, targetID);
			if (!entry) return message.sendLocale('commandDivorceNotTaken');

			// Ask the user if they're sure
			const accept = await message.ask(message.language.get('commandDivorcePrompt'));
			if (!accept) return message.sendLocale('commandDivorceCancel');

			// Remove the spouse
			await users.deleteSpouse(entry);

			// Tell the user about the divorce
			floatPromise(
				this,
				resolveOnErrorCodes(
					user.send(message.language.get('commandDivorceDm', { user: message.author.username })),
					RESTJSONErrorCodes.CannotSendMessagesToThisUser
				)
			);
			return message.sendLocale('commandDivorceSuccess', [{ user: user.toString() }]);
		});
	}
}
