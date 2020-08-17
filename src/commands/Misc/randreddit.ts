import { FetchError } from '@lib/errors/FetchError';
import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { Reddit } from '@lib/types/definitions/Reddit';
import { fetch, FetchResultTypes } from '@utils/util';
import { TextChannel } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';

export default class extends SkyraCommand {
	private readonly kBlacklist = /nsfl|morbidreality|watchpeopledie|fiftyfifty|stikk/i;
	private readonly kTitleBlacklist = /nsfl/i;
	private readonly kUsernameRegex = /^(?:\/?u\/)?[A-Za-z0-9_-]*$/;

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['rand', 'rand-reddit', 'reddit'],
			cooldown: 3,
			description: (language) => language.get('COMMAND_RANDREDDIT_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_RANDREDDIT_EXTENDED'),
			usage: '<reddit:reddit>'
		});

		this.createCustomResolver('reddit', (arg, _possible, message) => {
			if (!arg) throw message.language.get('COMMAND_RANDREDDIT_REQUIRED_REDDIT');
			if (!this.kUsernameRegex.test(arg)) throw message.language.get('COMMAND_RANDREDDIT_INVALID_ARGUMENT');
			if (this.kBlacklist.test(arg)) throw message.language.get('COMMAND_RANDREDDIT_BANNED');
			return arg.toLowerCase();
		});
	}

	public async run(message: KlasaMessage, [reddit]: [string]) {
		const { kind, data } = await this.fetchData(message, reddit);

		if (!kind || !data || data.children.length === 0) {
			throw message.language.get('COMMAND_RANDREDDIT_FAIL');
		}

		const nsfwEnabled = message.guild !== null && (message.channel as TextChannel).nsfw;
		const posts = nsfwEnabled
			? data.children.filter((child) => !this.kTitleBlacklist.test(child.data.title))
			: data.children.filter((child) => !child.data.over_18 && !this.kTitleBlacklist.test(child.data.title));

		if (posts.length === 0) {
			throw message.language.get(nsfwEnabled ? 'COMMAND_RANDREDDIT_ALL_NSFL' : 'COMMAND_RANDREDDIT_ALL_NSFW');
		}

		const post = posts[Math.floor(Math.random() * posts.length)].data;
		return message.sendLocale('COMMAND_RANDREDDIT_MESSAGE', [post.title, post.author, post.spoiler ? `||${post.url}||` : post.url]);
	}

	private async fetchData(message: KlasaMessage, reddit: string) {
		try {
			return await fetch<Reddit.Response<'posts'>>(`https://www.reddit.com/r/${reddit}/.json?limit=30`, FetchResultTypes.JSON);
		} catch (error) {
			this.handleError(message, error);
		}
	}

	private handleError(message: KlasaMessage, error: FetchError): never {
		let parsed: RedditError | undefined = undefined;
		try {
			parsed = error.toJSON() as RedditError;
		} catch {
			throw message.language.get('SYSTEM_PARSE_ERROR');
		}

		switch (parsed.error) {
			case 403: {
				if (parsed.reason === 'private') throw message.language.get('COMMAND_RANDREDDIT_ERROR_PRIVATE');
				if (parsed.reason === 'quarantined') throw message.language.get('COMMAND_RANDREDDIT_ERROR_QUARANTINED');
				break;
			}
			case 404: {
				if (!('reason' in parsed)) throw message.language.get('COMMAND_RANDREDDIT_ERROR_NOT_FOUND');
				if (parsed.reason === 'banned') throw message.language.get('COMMAND_RANDREDDIT_ERROR_BANNED');
				break;
			}
			case 500: {
				throw message.language.get('SYSTEM_EXTERNAL_SERVER_ERROR');
			}
		}

		throw error;
	}
}

type RedditError = RedditNotFound | RedditBanned | RedditForbidden | RedditQuarantined | RedditServerError;

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

interface RedditServerError {
	message: 'Internal Server Error';
	error: 500;
}
