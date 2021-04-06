import { LanguageKeys } from '#lib/i18n/languageKeys';
import { PaginatedMessageCommand, UserLazyPaginatedMessage } from '#lib/structures';
import { GuildMessage } from '#lib/types';
import { LongWidthSpace } from '#utils/constants';
import { skip, take } from '#utils/iterator';
import type { LeaderboardUser } from '#utils/Leaderboard';
import type Collection from '@discordjs/collection';
import { ApplyOptions } from '@sapphire/decorators';
import { MessageEmbed } from 'discord.js';

type LeaderboardUsers = Collection<string, LeaderboardUser>;

@ApplyOptions<PaginatedMessageCommand.Options>({
	aliases: ['top', 'scoreboard'],
	bucket: 2,
	cooldown: 10,
	description: LanguageKeys.Commands.Social.LeaderboardDescription,
	extendedHelp: LanguageKeys.Commands.Social.LeaderboardExtended,
	runIn: ['text'],
	spam: true
})
export class UserPaginatedMessageCommand extends PaginatedMessageCommand {
	public async run(message: GuildMessage, args: PaginatedMessageCommand.Args) {
		const list = await this.context.client.leaderboard.fetch(message.guild.id);
		const index = args.finished ? 1 : await args.pick('integer', { minimum: 1, maximum: Math.ceil(list.size / 10) });

		const { position } = list.get(message.author.id) ?? { position: list.size + 1 };
		const display = await this.buildDisplay(args, list, index - 1, position);
		return display.run(message.author, message.channel);
	}

	private async buildDisplay(args: PaginatedMessageCommand.Args, list: LeaderboardUsers, index: number, position: number) {
		const footerText = args.t(LanguageKeys.Commands.Social.ScoreboardFooter, { position, total: list.size });
		const footerIcon = args.message.author.displayAvatarURL({ format: 'png', size: 64, dynamic: true });
		const display = new UserLazyPaginatedMessage({
			template: new MessageEmbed()
				.setColor(await this.context.db.fetchColor(args.message))
				.setTitle(args.t(LanguageKeys.Commands.Social.LeaderboardHeader))
				.setFooter(` - ${footerText}`, footerIcon)
				.setTimestamp()
		});

		for (let i = 0, m = Math.ceil(list.size / 10); i < m; ++i) {
			display.addPageEmbed(() => this.generatePage(args, list, i));
		}

		display.setIndex(Math.ceil((index - 1) / 10));
		return display;
	}

	private generatePage(args: PaginatedMessageCommand.Args, list: LeaderboardUsers, index: number): MessageEmbed {
		const pad = (index * 10).toString().length;

		const lines: string[] = [];
		const members = args.message.guild!.members.cache;
		for (const [id, value] of take(skip(list.entries(), index * 10), 10)) {
			const name = members.get(id)?.displayName ?? args.t(LanguageKeys.Commands.Social.LeaderboardUnknownUser, { user: id });
			lines.push(
				`❯ \`${value.position.toString().padStart(pad, ' ')}\`: ${name}`,
				`${LongWidthSpace}└─ ${args.t(LanguageKeys.Globals.NumberValue, { value: value.points })}`
			);
		}

		return new MessageEmbed().setDescription(lines.join('\n'));
	}
}
