import { CommandStore, KlasaMessage } from 'klasa';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { fetch } from '../../lib/util/util';
import { TextChannel } from 'discord.js';
import { Reddit } from '../../lib/types/definitions/Reddit';

const blacklist = /nsfl|morbidreality|watchpeopledie|fiftyfifty/i;
const titleBlacklist = /nsfl/i;

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['rand', 'rand-reddit', 'reddit'],
			cooldown: 3,
			description: language => language.tget('COMMAND_RANDREDDIT_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_RANDREDDIT_EXTENDED'),
			usage: '<reddit:reddit>'
		});

		this.createCustomResolver('reddit', (arg, _possible, message) => {
			if (!arg) throw message.language.tget('COMMAND_RANDREDDIT_REQUIRED_REDDIT');
			if (blacklist.test(arg)) throw message.language.tget('COMMAND_RANDREDDIT_BANNED');
			return arg.toLowerCase();
		});
	}

	public async run(message: KlasaMessage, [reddit]: [string]) {
		const { kind, data } = await fetch(`https://www.reddit.com/r/${reddit}/.json?limit=30`, 'json') as Reddit.Response<'posts'>;

		if (!kind || !data || data.children.length === 0) {
			throw message.language.tget('COMMAND_RANDREDDIT_FAIL');
		}

		const nsfwEnabled = message.guild !== null && (message.channel as TextChannel).nsfw;
		const posts = nsfwEnabled
			? data.children.filter(child => !titleBlacklist.test(child.data.title))
			: data.children.filter(child => !child.data.over_18 && !titleBlacklist.test(child.data.title));

		if (posts.length === 0) {
			throw message.language.tget(nsfwEnabled ? 'COMMAND_RANDREDDIT_ALL_NSFL' : 'COMMAND_RANDREDDIT_ALL_NSFW');
		}

		const post = posts[Math.floor(Math.random() * posts.length)].data;
		return message.sendLocale('COMMAND_RANDREDDIT_MESSAGE', [
			post.title,
			post.author,
			post.spoiler ? `||${post.url}||` : post.url
		]);
	}

}
