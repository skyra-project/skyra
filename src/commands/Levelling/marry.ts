import { LanguageKeys } from '#lib/i18n/languageKeys';
import { PaginatedMessageCommand } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { CLIENT_ID } from '#root/config';
import { ApplyOptions } from '@sapphire/decorators';
import { CommandContext } from '@sapphire/framework';
import type { User } from 'discord.js';
import { TFunction } from 'i18next';

const AELIA_ID = '338249781594030090';

@ApplyOptions<PaginatedMessageCommand.Options>({
	cooldown: 30,
	description: LanguageKeys.Commands.Social.MarryDescription,
	extendedHelp: LanguageKeys.Commands.Social.MarryExtended
})
export class UserPaginatedMessageCommand extends PaginatedMessageCommand {
	public async run(message: GuildMessage, args: PaginatedMessageCommand.Args, context: CommandContext) {
		const user = args.finished ? null : await args.pick('userName');
		return user ? this.marry(message, args.t, user) : this.context.stores.get('commands').get('married')!.run(message, args, context);
	}

	private async marry(message: GuildMessage, t: TFunction, user: User) {
		const { author } = message;

		switch (user.id) {
			case CLIENT_ID:
				return message.send(t(LanguageKeys.Commands.Social.MarrySkyra));
			case AELIA_ID:
				return message.send(t(LanguageKeys.Commands.Social.MarryAelia));
			case author.id:
				return message.send(t(LanguageKeys.Commands.Social.MarrySelf));
		}
		if (user.bot) return message.send(t(LanguageKeys.Commands.Social.MarryBots));

		const { users, clients } = this.context.db;
		const clientSettings = await clients.findOne(CLIENT_ID);
		const premiumUsers = clientSettings?.userBoost ?? [];
		return users.lock([message.author.id, user.id], async (authorID, targetID) => {
			// Retrieve the author's spouses
			const spouses = await users.fetchSpouses(authorID);
			if (spouses.includes(targetID)) {
				this.error(LanguageKeys.Commands.Social.MarryAlreadyMarried, { user: user.toString() });
			}

			// Check if the author can marry another user
			const authorLimit = premiumUsers.includes(authorID) ? 20 : 10;
			if (spouses.length >= authorLimit) {
				this.error(LanguageKeys.Commands.Social.MarryAuthorTooMany, { limit: authorLimit });
			}

			// Retrieve the target's spouses
			const targetSpouses = await users.fetchSpouses(targetID);

			// Check if the target can marry another user
			const targetLimit = premiumUsers.includes(targetID) ? 20 : 10;
			if (targetSpouses.length >= targetLimit) {
				this.error(LanguageKeys.Commands.Social.MarryTargetTooMany, { limit: targetLimit });
			}

			// Warn if starting polygamy:
			// Check if the author is already monogamous.
			if (spouses.length === 1) {
				const answer = await message.ask(t(LanguageKeys.Commands.Social.MarryAuthorTaken, { author }));
				if (answer)
					return message.send(
						t(LanguageKeys.Commands.Social.MarryAuthorMultipleCancel, {
							user: await this.context.client.users.fetch(spouses[0]).then((user) => user.username)
						})
					);
				// Check if the author's first potential spouse is already married.
			} else if (spouses.length === 0 && targetSpouses.length > 0) {
				const answer = await message.ask(t(LanguageKeys.Commands.Social.MarryTaken, { count: targetSpouses.length }));
				if (answer) return message.send(t(LanguageKeys.Commands.Social.MarryMultipleCancel));
			}

			const answer = await message.ask(t(LanguageKeys.Commands.Social.MarryPetition, { author, user }), undefined, { target: user });
			if (answer === null) return message.send(t(LanguageKeys.Commands.Social.MarryNoReply));
			if (!answer) return message.send(t(LanguageKeys.Commands.Social.MarryDenied));

			const settings = await users.ensure(authorID, { relations: ['spouses'] });
			settings.spouses = (settings.spouses ?? []).concat(await users.ensure(targetID));
			await settings.save();

			return message.send(t(LanguageKeys.Commands.Social.MarryAccepted, { author: author.toString(), user: user.toString() }));
		});
	}
}
