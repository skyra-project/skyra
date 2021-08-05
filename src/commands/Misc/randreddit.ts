import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import type { Reddit } from '#lib/types/definitions/Reddit';
import { ApplyOptions } from '@sapphire/decorators';
import { isNsfwChannel } from '@sapphire/discord.js-utilities';
import { fetch, FetchResultTypes, QueryError } from '@sapphire/fetch';
import { Args } from '@sapphire/framework';
import { send } from '@skyra/editable-commands';

const kBlockList = /nsfl|morbidreality|watchpeopledie|fiftyfifty|stikk/i;
const kTitleBlockList = /nsfl/i;
const kUsernameRegex = /^(?:\/?u\/)?[A-Za-z0-9_-]*$/;

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['rand', 'rand-reddit', 'reddit'],
	description: LanguageKeys.Commands.Misc.RandRedditDescription,
	extendedHelp: LanguageKeys.Commands.Misc.RandRedditExtended
})
export class UserCommand extends SkyraCommand {
	public async run(message: GuildMessage, args: SkyraCommand.Args) {
		const reddit = await args.pick(UserCommand.reddit);
		const { kind, data } = await this.fetchData(reddit);

		if (!kind || !data || data.children.length === 0) {
			this.error(LanguageKeys.Commands.Misc.RandRedditFail);
		}

		const nsfwEnabled = isNsfwChannel(message.channel);
		const posts = nsfwEnabled
			? data.children.filter((child) => !kTitleBlockList.test(child.data.title))
			: data.children.filter((child) => !child.data.over_18 && !kTitleBlockList.test(child.data.title));

		if (posts.length === 0) {
			this.error(nsfwEnabled ? LanguageKeys.Commands.Misc.RandRedditAllNsfl : LanguageKeys.Commands.Misc.RandRedditAllNsfw);
		}

		const post = posts[Math.floor(Math.random() * posts.length)].data;

		const content = args.t(LanguageKeys.Commands.Misc.RandRedditMessage, {
			title: post.title,
			author: post.author,
			url: post.spoiler ? `||${post.url}||` : post.url
		});
		return send(message, { content, allowedMentions: { users: [], roles: [] } });
	}

	private async fetchData(reddit: string) {
		try {
			return await fetch<Reddit.Response<'posts'>>(`https://www.reddit.com/r/${reddit}/.json?limit=30`, FetchResultTypes.JSON);
		} catch (error) {
			this.handleError(error);
		}
	}

	private handleError(error: QueryError): never {
		let parsed: RedditError;
		try {
			parsed = error.toJSON() as RedditError;
		} catch {
			this.error(LanguageKeys.System.ParseError);
		}

		switch (parsed.error) {
			case 403: {
				if (parsed.reason === 'private') this.error(LanguageKeys.Commands.Misc.RandRedditErrorPrivate);
				if (parsed.reason === 'quarantined') this.error(LanguageKeys.Commands.Misc.RandRedditErrorQuarantined);
				break;
			}
			case 404: {
				if (!Reflect.has(parsed, 'reason')) this.error(LanguageKeys.Commands.Misc.RandRedditErrorNotFound);
				if (Reflect.get(parsed, 'reason') === 'banned') this.error(LanguageKeys.Commands.Misc.RandRedditErrorBanned);
				break;
			}
			case 500: {
				this.error(LanguageKeys.System.ExternalServerError);
			}
		}

		throw error;
	}

	private static reddit = Args.make<string>((parameter, { argument }) => {
		if (!kUsernameRegex.test(parameter)) {
			return Args.error({ parameter, argument, identifier: LanguageKeys.Commands.Misc.RandRedditInvalidArgument });
		}

		if (kBlockList.test(parameter)) return Args.error({ parameter, argument, identifier: LanguageKeys.Commands.Misc.RandRedditBanned });

		return Args.ok(parameter.toLowerCase());
	});
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
