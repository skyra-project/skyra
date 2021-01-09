import { SkyraCommand } from '#lib/structures/SkyraCommand';
import { GuildMessage } from '#lib/types';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { LeaderboardUser } from '#utils/Leaderboard';
import { pickRandom } from '#utils/util';
import Collection from '@discordjs/collection';
import { CommandStore } from 'klasa';

const titles = {
	global: '🌐 Global Score Scoreboard',
	local: '🏡 Local Score Scoreboard'
};

export default class extends SkyraCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['top', 'scoreboard'],
			bucket: 2,
			cooldown: 10,
			description: LanguageKeys.Commands.Social.LeaderboardDescription,
			extendedHelp: LanguageKeys.Commands.Social.LeaderboardExtended,
			runIn: ['text'],
			usage: '[global|local] [index:integer]',
			usageDelim: ' ',
			spam: true
		});
	}

	public async run(message: GuildMessage, [type = 'local', index = 1]: ['global' | 'local', number]) {
		const list = await this.client.leaderboard.fetch(type === 'local' ? message.guild.id : undefined);

		const { position } = list.get(message.author.id) || { position: list.size + 1 };
		const page = await this.generatePage(message, list, index - 1, position);
		return message.send(`${titles[type]}\n${page.join('\n')}`, { code: 'asciidoc' });
	}

	public async generatePage(message: GuildMessage, list: Collection<string, LeaderboardUser>, index: number, position: number) {
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
					this.client.users.fetch(id).then((user) => {
						value.name = user.username || `Unknown: ${id}`;
					})
				);
			}
		}

		const t = await message.fetchT();
		if (promises.length) {
			await message.send(pickRandom(t(LanguageKeys.System.Loading)));
			await Promise.all(promises);
		}
		for (const value of retrievedPage) {
			page.push(`• ${value.position.toString().padStart(indexLength, ' ')}: ${this.keyUser(value.name!).padEnd(25, ' ')} :: ${value.points}`);
		}

		page.push('');
		page.push(t(LanguageKeys.Commands.Social.LeaderboardListifyPage, { page: index + 1, pageCount, results: listSize.toLocaleString() }));
		page.push(t(LanguageKeys.Commands.Social.ScoreboardPosition, { position }));

		return page;
	}

	public keyUser(str: string) {
		const user = this.client.users.cache.get(str);
		if (user) str = user.username;
		if (str.length < 25) return str;
		return `${str.substring(0, 22)}...`;
	}
}
