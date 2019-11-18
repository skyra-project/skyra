import { CommandStore, KlasaMessage } from 'klasa';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { fetch, FetchResultTypes } from '../../lib/util/util';
import { TextChannel } from 'discord.js';
import { Reddit } from '../../lib/types/definitions/Reddit';


export default class extends SkyraCommand {

	private readonly kBlacklist = /nsfl|morbidreality|watchpeopledie|fiftyfifty|stikk/i;
	private readonly kTitleBlacklist = /nsfl/i;
	private readonly kUsernameRegex = /^(?:\/?u\/)?[A-Za-z0-9_-]*$/;

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
			if (!this.kUsernameRegex.test(arg)) throw message.language.tget('COMMAND_RANDREDDIT_INVALID_ARGUMENT');
			if (this.kBlacklist.test(arg)) throw message.language.tget('COMMAND_RANDREDDIT_BANNED');
			return arg.toLowerCase();
		});
	}

	public async run(message: KlasaMessage, [reddit]: [string]) {
		const { kind, data } = await this.fetchData(message, reddit);

		if (!kind || !data || data.children.length === 0) {
			throw message.language.tget('COMMAND_RANDREDDIT_FAIL');
		}

		const nsfwEnabled = message.guild !== null && (message.channel as TextChannel).nsfw;
		const posts = nsfwEnabled
			? data.children.filter(child => !this.kTitleBlacklist.test(child.data.title))
			: data.children.filter(child => !child.data.over_18 && !this.kTitleBlacklist.test(child.data.title));

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

	private async fetchData(message: KlasaMessage, reddit: string) {
		try {
			return await fetch(`https://www.reddit.com/r/${reddit}/.json?limit=30`, FetchResultTypes.JSON) as Reddit.Response<'posts'>;
		} catch (error) {
			this.handleError(message, error);
		}
	}

	private handleError(message: KlasaMessage, error: Error): never {
		let parsed: RedditError;
		try {
			parsed = JSON.parse(error.message) as RedditError;
		} catch {
			throw message.language.tget('SYSTEM_PARSE_ERROR');
		}

		if (parsed.error === 403) {
			if (parsed.reason === 'private') throw message.language.tget('COMMAND_RANDREDDIT_ERROR_PRIVATE');
			if (parsed.reason === 'quarantined') throw message.language.tget('COMMAND_RANDREDDIT_ERROR_QUARANTINED');
		} else if (parsed.error === 404) {
			if (!('reason' in parsed)) throw message.language.tget('COMMAND_RANDREDDIT_ERROR_NOT_FOUND');
			if (parsed.reason === 'banned') throw message.language.tget('COMMAND_RANDREDDIT_ERROR_BANNED');
		}

		throw error;
	}

}

type RedditError = RedditNotFound | RedditBanned | RedditForbidden | RedditQuarantined;

interface RedditForbidden {
	reason: 'private';
	message: 'Forbidden';
	error: 403;
}

interface RedditQuarantined {
	reason: 'quarantined';
	quarantine_message_html: string;
	message: 'Forbidden';
	quarantine_message: string;
	error: 403;
}

interface RedditNotFound {
	message: 'Not Found';
	error: 404;
}

interface RedditBanned {
	reason: 'banned';
	message: 'Not Found';
	error: 404;
}
