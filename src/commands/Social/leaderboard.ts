import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { GuildMessage, Scope } from '#lib/types';
import type { LeaderboardUser } from '#utils/Leaderboard';
import { pickRandom } from '#utils/util';
import type Collection from '@discordjs/collection';
import { ApplyOptions } from '@sapphire/decorators';
import type { TFunction } from 'i18next';

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
		const index = args.finished ? 1 : await args.pick('integer', { minimum: 1 });

		const list = await this.context.client.leaderboard.fetch(scope === Scope.Local ? message.guild.id : undefined);

		const { position } = list.get(message.author.id) || { position: list.size + 1 };
		const page = await this.generatePage(message, args.t, list, index - 1, position);
		return message.send(`${titles[scope]}\n${page.join('\n')}`, { code: 'asciidoc' });
	}

	public async generatePage(message: GuildMessage, t: TFunction, list: Collection<string, LeaderboardUser>, index: number, position: number) {
		if (index > list.size / 10 || index < 0) index = 0;
		const retrievedPage: LeaderboardUser[] = [];
		const promises: Promise<void>[] = [];
		const page: string[] = [];
		const listSize = list.size;
		const pageCount = Math.ceil(listSize / 10);
		const indexLength = (index * 10 + 10).toString().length;
		const positionOffset = index * 10;
		for (const [id, value] of list) {
			if (positionOffset > value.position) continue;
			if (positionOffset + 10 < value.position) break;
			retrievedPage.push(value);
			if (!value.name) {
				promises.push(
					this.context.client.users.fetch(id).then((user) => {
						value.name = user.username || `Unknown: ${id}`;
					})
				);
			}
		}

		if (promises.length) {
			await message.send(pickRandom(t(LanguageKeys.System.Loading)));
			await Promise.all(promises);
		}
		for (const value of retrievedPage) {
			page.push(`• ${value.position.toString().padStart(indexLength, ' ')}: ${this.keyUser(value.name!).padEnd(25, ' ')} :: ${value.points}`);
		}

		page.push('');
		page.push(t(LanguageKeys.Commands.Social.LeaderboardListifyPage, { page: index + 1, pageCount, results: listSize }));
		page.push(t(LanguageKeys.Commands.Social.ScoreboardPosition, { position }));

		return page;
	}

	public keyUser(str: string) {
		const user = this.context.client.users.cache.get(str);
		if (user) str = user.username;
		if (str.length < 25) return str;
		return `${str.substring(0, 22)}...`;
	}
}
