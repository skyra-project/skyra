import { LanguageKeys } from '#lib/i18n/languageKeys';
import { PaginatedMessageCommand, UserPaginatedMessage } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { sendLoadingMessage } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { chunk } from '@sapphire/utilities';
import { MessageEmbed } from 'discord.js';

@ApplyOptions<PaginatedMessageCommand.Options>({
	cooldown: 10,
	description: LanguageKeys.Commands.Social.MarriedDescription,
	extendedHelp: LanguageKeys.Commands.Social.MarriedExtended
})
export class UserPaginatedMessageCommand extends PaginatedMessageCommand {
	public async run(message: GuildMessage, args: PaginatedMessageCommand.Args) {
		const response = await sendLoadingMessage(message, args.t);

		const { users } = this.context.db;
		const spouses = await users.fetchSpouses(message.author.id);
		if (spouses.length === 0) return message.send(args.t(LanguageKeys.Commands.Social.MarryNotTaken));

		const usernames = chunk(await Promise.all(spouses.map((user) => this.fetchUser(user))), 20);

		const display = new UserPaginatedMessage({ template: new MessageEmbed().setColor(await this.context.db.fetchColor(message)) });
		for (const usernameChunk of usernames) {
			display.addPageEmbed((embed) => embed.setDescription(args.t(LanguageKeys.Commands.Social.MarryWith, { users: usernameChunk })));
		}

		await display.start(response as GuildMessage, message.author);
		return response;
	}

	private async fetchUser(userID: string) {
		const user = await this.context.client.users.fetch(userID);
		return `${user.username} (\`${user.id}\`)`;
	}
}
