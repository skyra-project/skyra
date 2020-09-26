import { DbSet } from '@lib/structures/DbSet';
import { RichDisplayCommand, RichDisplayCommandOptions } from '@lib/structures/RichDisplayCommand';
import { UserRichDisplay } from '@lib/structures/UserRichDisplay';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { CLIENT_ID } from '@root/config';
import { chunk } from '@sapphire/utilities';
import { ApplyOptions, CreateResolvers } from '@skyra/decorators';
import { BrandingColors } from '@utils/constants';
import { pickRandom } from '@utils/util';
import assert from 'assert';
import { DMChannel, MessageEmbed, NewsChannel, TextChannel, User } from 'discord.js';
import { KlasaMessage } from 'klasa';

const REGEXP_ACCEPT = /^(y|ye|yea|yeah|yes|y-yes)$/i;
const SNEYRA_ID = '338249781594030090';

enum YesNoAnswer {
	Timeout,
	ImplicitNo,
	Yes
}

async function askYesNo(channel: TextChannel | DMChannel | NewsChannel, user: User, question: string): Promise<YesNoAnswer> {
	await channel.send(question);
	const messages = await channel.awaitMessages((msg) => msg.author.id === user.id, { time: 60000, max: 1 });
	if (!messages.size) return YesNoAnswer.Timeout;

	const response = messages.first()!;
	return REGEXP_ACCEPT.test(response.content) ? YesNoAnswer.Yes : YesNoAnswer.ImplicitNo;
}

@ApplyOptions<RichDisplayCommandOptions>({
	cooldown: 30,
	description: (language) => language.get(LanguageKeys.Commands.Social.MarryDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Social.MarryExtended),
	runIn: ['text'],
	usage: '(user:username)'
})
@CreateResolvers([
	[
		'username',
		(arg, possible, msg) => {
			if (!arg) return undefined;
			return msg.client.arguments.get('username')!.run(arg, possible, msg);
		}
	]
])
export default class extends RichDisplayCommand {
	public run(message: KlasaMessage, [user]: [User | undefined]) {
		return user ? this.marry(message, user) : this.display(message);
	}

	private async display(message: KlasaMessage) {
		const response = await message.sendEmbed(
			new MessageEmbed().setDescription(pickRandom(message.language.get(LanguageKeys.System.Loading))).setColor(BrandingColors.Secondary)
		);

		const { users } = await DbSet.connect();
		const spouses = await users.fetchSpouses(message.author.id);
		if (spouses.length === 0) return message.sendLocale(LanguageKeys.Commands.Social.MarryNotTaken);

		const usernames = chunk(
			await Promise.all(spouses.map(async (user) => `${await this.client.users.fetch(user).then((user) => user.username)} (\`${user}\`)`)),
			20
		);

		const display = new UserRichDisplay(new MessageEmbed().setColor(await DbSet.fetchColor(message)));

		for (const usernameChunk of usernames) {
			display.addPage((embed: MessageEmbed) =>
				embed.setDescription(message.language.get(LanguageKeys.Commands.Social.MarryWith, { users: usernameChunk }))
			);
		}

		await display.start(response, message.author.id);
		return response;
	}

	private async marry(message: KlasaMessage, user: User) {
		const { author, channel, language } = message;

		switch (user.id) {
			case CLIENT_ID:
				return message.sendLocale(LanguageKeys.Commands.Social.MarrySkyra);
			case SNEYRA_ID:
				return message.sendLocale(LanguageKeys.Commands.Social.MarrySneyra);
			case author.id:
				return message.sendLocale(LanguageKeys.Commands.Social.MarrySelf);
		}
		if (user.bot) return message.sendLocale(LanguageKeys.Commands.Social.MarryBots);

		const { users, clients } = await DbSet.connect();
		const clientSettings = await clients.findOne(CLIENT_ID);
		const premiumUsers = clientSettings?.userBoost ?? [];
		return users.lock([message.author.id, user.id], async (authorID, targetID) => {
			// Retrieve the author's spouses
			const spouses = await users.fetchSpouses(authorID);
			if (spouses.includes(targetID)) {
				throw message.language.get(LanguageKeys.Commands.Social.MarryAlreadyMarried, { user });
			}

			// Check if the author can marry another user
			const authorLimit = premiumUsers.includes(authorID) ? 20 : 10;
			if (spouses.length >= authorLimit) {
				throw message.language.get(LanguageKeys.Commands.Social.MarryAuthorTooMany, { limit: authorLimit });
			}

			// Retrieve the target's spouses
			const targetSpouses = await users.fetchSpouses(targetID);

			// Check if the target can marry another user
			const targetLimit = premiumUsers.includes(targetID) ? 20 : 10;
			if (targetSpouses.length >= targetLimit) {
				throw message.language.get(LanguageKeys.Commands.Social.MarryTargetTooMany, { limit: targetLimit });
			}

			// Warn if starting polygamy:
			// Check if the author is already monogamous.
			if (spouses.length === 1) {
				const answer = await askYesNo(channel, author, language.get(LanguageKeys.Commands.Social.MarryAuthorTaken, { author }));
				if (answer !== YesNoAnswer.Yes)
					return message.sendLocale(LanguageKeys.Commands.Social.MarryAuthorMultipleCancel, [
						{ user: await this.client.users.fetch(spouses[0]).then((user) => user.username) }
					]);
				// Check if the author's first potential spouse is already married.
			} else if (spouses.length === 0 && targetSpouses.length > 0) {
				const answer = await askYesNo(
					channel,
					author,
					language.get(
						targetSpouses.length === 1 ? LanguageKeys.Commands.Social.MarryTaken : LanguageKeys.Commands.Social.MarryTakenPlural,
						{ count: targetSpouses.length }
					)
				);
				if (answer !== YesNoAnswer.Yes) return message.sendLocale(LanguageKeys.Commands.Social.MarryMultipleCancel);
			}

			const answer = await askYesNo(channel, user, language.get(LanguageKeys.Commands.Social.MarryPetition, { author, user }));
			switch (answer) {
				case YesNoAnswer.Timeout:
					return message.sendLocale(LanguageKeys.Commands.Social.MarryNoreply);
				case YesNoAnswer.ImplicitNo:
					return message.sendLocale(LanguageKeys.Commands.Social.MarryDenied);
				case YesNoAnswer.Yes:
					break;
				default:
					assert.fail('unreachable');
			}

			const settings = await users.ensure(authorID, { relations: ['spouses'] });
			settings.spouses = (settings.spouses ?? []).concat(await users.ensure(targetID));
			await settings.save();

			return message.sendLocale(LanguageKeys.Commands.Social.MarryAccepted, [{ author, user }]);
		});
	}
}
