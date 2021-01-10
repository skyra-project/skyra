import { DbSet } from '#lib/database';
import { RichDisplayCommand, RichDisplayCommandOptions } from '#lib/structures/RichDisplayCommand';
import { UserRichDisplay } from '#lib/structures/UserRichDisplay';
import { GuildMessage } from '#lib/types';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { BrandingColors } from '#utils/constants';
import { pickRandom } from '#utils/util';
import { chunk } from '@sapphire/utilities';
import { ApplyOptions } from '@skyra/decorators';
import { MessageEmbed } from 'discord.js';

@ApplyOptions<RichDisplayCommandOptions>({
	cooldown: 10,
	description: LanguageKeys.Commands.Social.MarriedDescription,
	extendedHelp: LanguageKeys.Commands.Social.MarriedExtended
})
export default class extends RichDisplayCommand {
	public run(message: GuildMessage) {
		return this.display(message);
	}

	private async display(message: GuildMessage) {
		const t = await message.fetchT();
		const response = await message.send(
			new MessageEmbed().setDescription(pickRandom(t(LanguageKeys.System.Loading))).setColor(BrandingColors.Secondary)
		);

		const { users } = await DbSet.connect();
		const spouses = await users.fetchSpouses(message.author.id);
		if (spouses.length === 0) return message.send(t(LanguageKeys.Commands.Social.MarryNotTaken));

		const usernames = chunk(
			await Promise.all(spouses.map(async (user) => `${await this.client.users.fetch(user).then((user) => user.username)} (\`${user}\`)`)),
			20
		);

		const display = new UserRichDisplay(new MessageEmbed().setColor(await DbSet.fetchColor(message)));

		for (const usernameChunk of usernames) {
			display.addPage((embed: MessageEmbed) => embed.setDescription(t(LanguageKeys.Commands.Social.MarryWith, { users: usernameChunk })));
		}

		await display.start(response, message.author.id);
		return response;
	}
}
