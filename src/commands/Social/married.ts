import { DbSet } from '#lib/database';
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
	public run(message: GuildMessage) {
		return this.display(message);
	}

	private async display(message: GuildMessage) {
		const t = await message.fetchT();
		const response = await sendLoadingMessage(message, t);

		const { users } = await DbSet.connect();
		const spouses = await users.fetchSpouses(message.author.id);
		if (spouses.length === 0) return message.send(t(LanguageKeys.Commands.Social.MarryNotTaken));

		const usernames = chunk(
			await Promise.all(
				spouses.map(async (user) => `${await this.context.client.users.fetch(user).then((user) => user.username)} (\`${user}\`)`)
			),
			20
		);

		const display = new UserPaginatedMessage({ template: new MessageEmbed().setColor(await DbSet.fetchColor(message)) });

		for (const usernameChunk of usernames) {
			display.addPageEmbed((embed) => embed.setDescription(t(LanguageKeys.Commands.Social.MarryWith, { users: usernameChunk })));
		}

		await display.start(response as GuildMessage, message.author);
		return response;
	}
}
