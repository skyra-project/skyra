import { LanguageKeys } from '#lib/i18n/languageKeys';
import { PaginatedMessageCommand, SkyraPaginatedMessage } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { sendLoadingMessage } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { chunk } from '@sapphire/utilities';
import { MessageEmbed } from 'discord.js';

@ApplyOptions<PaginatedMessageCommand.Options>({
	description: LanguageKeys.Commands.Social.MarriedDescription,
	detailedDescription: LanguageKeys.Commands.Social.MarriedExtended
})
export class UserPaginatedMessageCommand extends PaginatedMessageCommand {
	public async messageRun(message: GuildMessage, args: PaginatedMessageCommand.Args) {
		const response = await sendLoadingMessage(message, args.t);

		const { users } = this.container.db;
		const spouses = await users.fetchSpouses(message.author.id);
		if (spouses.length === 0) this.error(LanguageKeys.Commands.Social.MarryNotTaken);

		const usernames = chunk(await Promise.all(spouses.map((user) => this.fetchUser(user))), 20);

		const display = new SkyraPaginatedMessage({ template: new MessageEmbed().setColor(await this.container.db.fetchColor(message)) });
		for (const usernameChunk of usernames) {
			display.addPageEmbed((embed) => embed.setDescription(args.t(LanguageKeys.Commands.Social.MarryWith, { users: usernameChunk })));
		}

		await display.run(response, message.author);
		return response;
	}

	private async fetchUser(userId: string) {
		const user = await this.container.client.users.fetch(userId);
		return `${user.username} (\`${user.id}\`)`;
	}
}
