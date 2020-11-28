import { FetchError } from '#lib/errors/FetchError';
import { SkyraCommand } from '#lib/structures/SkyraCommand';
import { GuildMessage } from '#lib/types';
import { Reddit } from '#lib/types/definitions/Reddit';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { fetch, FetchResultTypes } from '#utils/util';
import { TextChannel } from 'discord.js';
import { CommandStore, Language } from 'klasa';

export default class extends SkyraCommand {
	private readonly kBlacklist = /nsfl|morbidreality|watchpeopledie|fiftyfifty|stikk/i;
	private readonly kTitleBlacklist = /nsfl/i;
	private readonly kUsernameRegex = /^(?:\/?u\/)?[A-Za-z0-9_-]*$/;

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['rand', 'rand-reddit', 'reddit'],
			cooldown: 3,
			description: (language) => language.get(LanguageKeys.Commands.Misc.RandRedditDescription),
			extendedHelp: (language) => language.get(LanguageKeys.Commands.Misc.RandRedditExtended),
			usage: '<reddit:reddit>'
		});

		this.createCustomResolver('reddit', async (arg, _possible, message) => {
			if (!arg) throw await message.fetchLocale(LanguageKeys.Commands.Misc.RandRedditRequiredReddit);
			if (!this.kUsernameRegex.test(arg)) throw await message.fetchLocale(LanguageKeys.Commands.Misc.RandRedditInvalidArgument);
			if (this.kBlacklist.test(arg)) throw await message.fetchLocale(LanguageKeys.Commands.Misc.RandRedditBanned);
			return arg.toLowerCase();
		});
	}

	public async run(message: GuildMessage, [reddit]: [string]) {
		const language = await message.fetchLanguage();
		const { kind, data } = await this.fetchData(language, reddit);

		if (!kind || !data || data.children.length === 0) {
			throw language.get(LanguageKeys.Commands.Misc.RandRedditFail);
		}

		const nsfwEnabled = message.guild !== null && (message.channel as TextChannel).nsfw;
		const posts = nsfwEnabled
			? data.children.filter((child) => !this.kTitleBlacklist.test(child.data.title))
			: data.children.filter((child) => !child.data.over_18 && !this.kTitleBlacklist.test(child.data.title));

		if (posts.length === 0) {
			throw language.get(nsfwEnabled ? LanguageKeys.Commands.Misc.RandRedditAllNsfl : LanguageKeys.Commands.Misc.RandRedditAllNsfw);
		}

		const post = posts[Math.floor(Math.random() * posts.length)].data;
		return message.send(
			language.get(LanguageKeys.Commands.Misc.RandRedditMessage, {
				title: post.title,
				author: post.author,
				url: post.spoiler ? `||${post.url}||` : post.url
			})
		);
	}

	private async fetchData(language: Language, reddit: string) {
		try {
			return await fetch<Reddit.Response<'posts'>>(`https://www.reddit.com/r/${reddit}/.json?limit=30`, FetchResultTypes.JSON);
		} catch (error) {
			this.handleError(error, language);
		}
	}

	private handleError(error: FetchError, language: Language): never {
		let parsed: RedditError | undefined = undefined;
		try {
			parsed = error.toJSON() as RedditError;
		} catch {
			throw language.get(LanguageKeys.System.ParseError);
		}

		switch (parsed.error) {
			case 403: {
				if (parsed.reason === 'private') throw language.get(LanguageKeys.Commands.Misc.RandRedditErrorPrivate);
				if (parsed.reason === 'quarantined') throw language.get(LanguageKeys.Commands.Misc.RandRedditErrorQuarantined);
				break;
			}
			case 404: {
				if (!Reflect.has(parsed, 'reason')) throw language.get(LanguageKeys.Commands.Misc.RandRedditErrorNotFound);
				if (Reflect.get(parsed, 'reason') === 'banned') throw language.get(LanguageKeys.Commands.Misc.RandRedditErrorBanned);
				break;
			}
			case 500: {
				throw language.get(LanguageKeys.System.ExternalServerError);
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
