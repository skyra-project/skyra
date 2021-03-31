import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand, UserLazyPaginatedMessage } from '#lib/structures';
import { GuildMessage, Scope } from '#lib/types';
import { skip, take } from '#utils/iterator';
import type { LeaderboardUser } from '#utils/Leaderboard';
import type Collection from '@discordjs/collection';
import { ApplyOptions } from '@sapphire/decorators';
import { MessageBuilder } from '@sapphire/discord.js-utilities';
import { MessageOptions } from 'discord.js';

const titles = {
	[Scope.Global]: '🌐 Global Score Scoreboard',
	[Scope.Local]: '🏡 Local Score Scoreboard'
};

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['top', 'scoreboard'],
	bucket: 2,
	cooldown: 10,
	description: LanguageKeys.Commands.Social.LeaderboardDescription,
	extendedHelp: LanguageKeys.Commands.Social.LeaderboardExtended,
	runIn: ['text'],
	spam: true
})
export class UserCommand extends SkyraCommand {
	public async run(message: GuildMessage, args: SkyraCommand.Args) {
		const scope = args.finished ? Scope.Local : await args.pick('scope').catch(() => Scope.Local);

		const list = await this.context.client.leaderboard.fetch(scope === Scope.Local ? message.guild.id : undefined);
		const index = args.finished ? 1 : await args.pick('integer', { minimum: 1, maximum: Math.ceil(list.size / 10) });

		const { position } = list.get(message.author.id) ?? { position: list.size + 1 };
		const display = this.buildDisplay(args, list, titles[scope], index - 1, position);
		return display.run(message.author, message.channel);
	}

	private buildDisplay(args: SkyraCommand.Args, list: Collection<string, LeaderboardUser>, header: string, index: number, position: number) {
		const display = new UserLazyPaginatedMessage();

		for (let i = 0, m = Math.ceil(list.size / 10); i < m; ++i) {
			display.addPage(() => this.generatePage(args, list, header, i, position));
		}

		display.setIndex(Math.ceil((index - 1) / 10));

		return display;
	}

	private async generatePage(
		args: SkyraCommand.Args,
		list: Collection<string, LeaderboardUser>,
		header: string,
		index: number,
		position: number
	): Promise<MessageOptions> {
		const page = [header];
		const listSize = list.size;
		const pageCount = Math.ceil(listSize / 10);
		const indexLength = (index * 10 + 10).toString().length;
		const positionOffset = index * 10;

		const members = args.message.guild!.members.cache;
		for (const [id, value] of take(skip(list.entries(), positionOffset), 10)) {
			const name = members.get(id)?.displayName ?? args.t(LanguageKeys.Commands.Social.LeaderboardUnknownUser, { user: id });
			page.push(`• ${value.position.toString().padStart(indexLength, ' ')}: ${name.padEnd(40, ' ')} :: ${value.points}`);
		}

		page.push('');
		page.push(args.t(LanguageKeys.Commands.Social.LeaderboardListifyPage, { page: index + 1, pageCount, results: listSize }));
		page.push(args.t(LanguageKeys.Commands.Social.ScoreboardPosition, { position }));

		return new MessageBuilder().setContent(page.join('\n')).setCode('asciidoc');
	}
}
