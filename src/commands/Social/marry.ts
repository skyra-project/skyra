import { DbSet } from '@lib/structures/DbSet';
import { RichDisplayCommand, RichDisplayCommandOptions } from '@lib/structures/RichDisplayCommand';
import { UserRichDisplay } from '@lib/structures/UserRichDisplay';
import { CLIENT_ID } from '@root/config';
import { chunk } from '@sapphire/utilities';
import { ApplyOptions, CreateResolvers } from '@skyra/decorators';
import { BrandingColors } from '@utils/constants';
import assert from 'assert';
import { DMChannel, MessageEmbed, TextChannel, User } from 'discord.js';
import { KlasaMessage } from 'klasa';

const REGEXP_ACCEPT = /^(y|ye|yea|yeah|yes|y-yes)$/i;
const SNEYRA_ID = '338249781594030090';

enum YesNoAnswer {
	Timeout,
	ImplicitNo,
	Yes
}

async function askYesNo(channel: TextChannel | DMChannel, user: User, question: string): Promise<YesNoAnswer> {
	await channel.send(question);
	const messages = await channel.awaitMessages((msg) => msg.author.id === user.id, { time: 60000, max: 1 });
	if (!messages.size) return YesNoAnswer.Timeout;

	const response = messages.first()!;
	return REGEXP_ACCEPT.test(response.content) ? YesNoAnswer.Yes : YesNoAnswer.ImplicitNo;
}

@ApplyOptions<RichDisplayCommandOptions>({
	cooldown: 30,
	description: (language) => language.get('COMMAND_MARRY_DESCRIPTION'),
	extendedHelp: (language) => language.get('COMMAND_MARRY_EXTENDED'),
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
			new MessageEmbed().setDescription(message.language.get('SYSTEM_LOADING')).setColor(BrandingColors.Secondary)
		);

		const { users } = await DbSet.connect();
		const spouses = await users.fetchSpouses(message.author.id);
		if (spouses.length === 0) return message.sendLocale('COMMAND_MARRY_NOTTAKEN');

		const usernames = chunk(
			await Promise.all(spouses.map(async (user) => `${await this.client.userTags.fetchUsername(user)} (\`${user}\`)`)),
			20
		);

		const display = new UserRichDisplay(new MessageEmbed().setColor(await DbSet.fetchColor(message)));

		for (const usernameChunk of usernames) {
			display.addPage((embed: MessageEmbed) => embed.setDescription(message.language.get('COMMAND_MARRY_WITH', { users: usernameChunk })));
		}

		await display.start(response, message.author.id);
		return response;
	}

	private async marry(message: KlasaMessage, user: User) {
		const { author, channel, language } = message;

		switch (user.id) {
			case CLIENT_ID:
				return message.sendLocale('COMMAND_MARRY_SKYRA');
			case SNEYRA_ID:
				return message.sendLocale('COMMAND_MARRY_SNEYRA');
			case author.id:
				return message.sendLocale('COMMAND_MARRY_SELF');
		}
		if (user.bot) return message.sendLocale('COMMAND_MARRY_BOTS');

		const { users, clients } = await DbSet.connect();
		const clientSettings = await clients.findOne(CLIENT_ID);
		const premiumUsers = clientSettings?.userBoost ?? [];
		return users.lock([message.author.id, user.id], async (authorID, targetID) => {
			// Retrieve the author's spouses
			const spouses = await users.fetchSpouses(authorID);
			if (spouses.includes(targetID)) {
				throw message.language.get('COMMAND_MARRY_ALREADY_MARRIED', { user });
			}

			// Check if the author can marry another user
			const authorLimit = premiumUsers.includes(authorID) ? 20 : 10;
			if (spouses.length >= authorLimit) {
				throw message.language.get('COMMAND_MARRY_AUTHOR_TOO_MANY', { limit: authorLimit });
			}

			// Retrieve the target's spouses
			const targetSpouses = await users.fetchSpouses(targetID);

			// Check if the target can marry another user
			const targetLimit = premiumUsers.includes(targetID) ? 20 : 10;
			if (targetSpouses.length >= targetLimit) {
				throw message.language.get('COMMAND_MARRY_TARGET_TOO_MANY', { limit: targetLimit });
			}

			// Warn if starting polygamy:
			// Check if the author is already monogamous.
			if (spouses.length === 1) {
				const answer = await askYesNo(channel, author, language.get('COMMAND_MARRY_AUTHOR_TAKEN', { author }));
				if (answer !== YesNoAnswer.Yes)
					return message.sendLocale('COMMAND_MARRY_AUTHOR_MULTIPLE_CANCEL', [
						{ user: await this.client.userTags.fetchUsername(spouses[0]) }
					]);
				// Check if the author's first potential spouse is already married.
			} else if (spouses.length === 0 && targetSpouses.length > 0) {
				const answer = await askYesNo(channel, author, language.get('COMMAND_MARRY_TAKEN', { spousesCount: targetSpouses.length }));
				if (answer !== YesNoAnswer.Yes) return message.sendLocale('COMMAND_MARRY_MULTIPLE_CANCEL');
			}

			const answer = await askYesNo(channel, user, language.get('COMMAND_MARRY_PETITION', { author, user }));
			switch (answer) {
				case YesNoAnswer.Timeout:
					return message.sendLocale('COMMAND_MARRY_NOREPLY');
				case YesNoAnswer.ImplicitNo:
					return message.sendLocale('COMMAND_MARRY_DENIED');
				case YesNoAnswer.Yes:
					break;
				default:
					assert.fail('unreachable');
			}

			const settings = await users.ensure(authorID, { relations: ['spouses'] });
			settings.spouses = (settings.spouses ?? []).concat(await users.ensure(targetID));
			await settings.save();

			return message.sendLocale('COMMAND_MARRY_ACCEPTED', [{ author, user }]);
		});
	}
}
