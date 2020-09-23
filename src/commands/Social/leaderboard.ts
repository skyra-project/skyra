import Collection from '@discordjs/collection';
import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { LeaderboardUser } from '@utils/Leaderboard';
import { pickRandom } from '@utils/util';
import { CommandStore, KlasaMessage } from 'klasa';

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
			description: (language) => language.get(LanguageKeys.Commands.Social.LeaderboardDescription),
			extendedHelp: (language) => language.get(LanguageKeys.Commands.Social.LeaderboardExtended),
			runIn: ['text'],
			usage: '[global|local] [index:integer]',
			usageDelim: ' ',
			spam: true
		});
	}

	public async run(message: KlasaMessage, [type = 'local', index = 1]: ['global' | 'local', number]) {
		const list = await this.client.leaderboard.fetch(type === 'local' ? message.guild!.id : undefined);

		const { position } = list.get(message.author.id) || { position: list.size + 1 };
		const page = await this.generatePage(message, list, index - 1, position);
		return message.sendMessage(`${titles[type]}\n${page.join('\n')}`, { code: 'asciidoc' });
	}

	public async generatePage(message: KlasaMessage, list: Collection<string, LeaderboardUser>, index: number, position: number) {
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

		if (promises.length) {
			await message.send(pickRandom(message.language.get(LanguageKeys.System.Loading)), []);
			await Promise.all(promises);
		}
		for (const value of retrievedPage) {
			page.push(`• ${value.position.toString().padStart(indexLength, ' ')}: ${this.keyUser(value.name!).padEnd(25, ' ')} :: ${value.points}`);
		}

		page.push('');
		page.push(message.language.get(LanguageKeys.FuzzySearch.Page, { page: index + 1, pageCount, results: listSize.toLocaleString() }));
		page.push(message.language.get(LanguageKeys.Misc.CommandScoreboardPosition, { position }));

		return page;
	}

	public keyUser(str: string) {
		const user = this.client.users.cache.get(str);
		if (user) str = user.username;
		if (str.length < 25) return str;
		return `${str.substring(0, 22)}...`;
	}
}
