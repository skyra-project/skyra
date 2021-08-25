import { LanguageKeys } from '#lib/i18n/languageKeys';
import { PaginatedMessageCommand } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { SISTER_CLIENTS } from '#root/config';
import { seconds } from '#utils/common';
import { promptConfirmation } from '#utils/functions';
import { ApplyOptions } from '@sapphire/decorators';
import type { CommandContext } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import type { User } from 'discord.js';
import type { TFunction } from 'i18next';

@ApplyOptions<PaginatedMessageCommand.Options>({
	cooldownDelay: seconds(30),
	description: LanguageKeys.Commands.Social.MarryDescription,
	extendedHelp: LanguageKeys.Commands.Social.MarryExtended
})
export class UserPaginatedMessageCommand extends PaginatedMessageCommand {
	public async run(message: GuildMessage, args: PaginatedMessageCommand.Args, context: CommandContext) {
		const user = args.finished ? null : await args.pick('userName');
		return user ? this.marry(message, args.t, user) : this.container.stores.get('commands').get('married')!.run(message, args, context);
	}

	private async marry(message: GuildMessage, t: TFunction, user: User) {
		const { author } = message;

		if (user.id === author.id) this.error(LanguageKeys.Commands.Social.MarrySelf);
		if (user.id === process.env.CLIENT_ID) this.error(LanguageKeys.Commands.Social.MarrySkyra);
		if (SISTER_CLIENTS.includes(user.id)) this.error(LanguageKeys.Commands.Social.MarrySister);
		if (user.bot) this.error(LanguageKeys.Commands.Social.MarryBots);

		const { users, clients } = this.container.db;
		const clientSettings = await clients.findOne(process.env.CLIENT_ID);
		const premiumUsers = clientSettings?.userBoost ?? [];
		return users.lock([message.author.id, user.id], async (authorId, targetId) => {
			// Retrieve the author's spouses
			const spouses = await users.fetchSpouses(authorId);
			if (spouses.includes(targetId)) {
				this.error(LanguageKeys.Commands.Social.MarryAlreadyMarried, { user: user.toString() });
			}

			// Check if the author can marry another user
			const authorLimit = premiumUsers.includes(authorId) ? 20 : 10;
			if (spouses.length >= authorLimit) {
				this.error(LanguageKeys.Commands.Social.MarryAuthorTooMany, { limit: authorLimit });
			}

			// Retrieve the target's spouses
			const targetSpouses = await users.fetchSpouses(targetId);

			// Check if the target can marry another user
			const targetLimit = premiumUsers.includes(targetId) ? 20 : 10;
			if (targetSpouses.length >= targetLimit) {
				this.error(LanguageKeys.Commands.Social.MarryTargetTooMany, { limit: targetLimit });
			}

			// Warn if starting polygamy:
			// Check if the author is already monogamous.
			if (spouses.length === 1) {
				const answer = await promptConfirmation(message, t(LanguageKeys.Commands.Social.MarryAuthorTaken, { author }));
				if (!answer) {
					const user = await this.container.client.users.fetch(spouses[0]).then((user) => user.username);
					const content = t(LanguageKeys.Commands.Social.MarryAuthorMultipleCancel, { user });
					return send(message, content);
				}
				// Check if the author's first potential spouse is already married.
			} else if (spouses.length === 0 && targetSpouses.length > 0) {
				const answer = await promptConfirmation(message, t(LanguageKeys.Commands.Social.MarryTaken, { count: targetSpouses.length }));
				if (!answer) this.error(LanguageKeys.Commands.Social.MarryMultipleCancel);
			}

			const answer = await promptConfirmation(message, {
				content: t(LanguageKeys.Commands.Social.MarryPetition, { author, user }),
				target: user
			});
			if (answer === null) this.error(LanguageKeys.Commands.Social.MarryNoReply);
			if (!answer) this.error(LanguageKeys.Commands.Social.MarryDenied);

			const settings = await users.ensure(authorId, { relations: ['spouses'] });
			settings.spouses = (settings.spouses ?? []).concat(await users.ensure(targetId));
			await settings.save();

			const content = t(LanguageKeys.Commands.Social.MarryAccepted, { author: author.toString(), user: user.toString() });
			return send(message, content);
		});
	}
}
