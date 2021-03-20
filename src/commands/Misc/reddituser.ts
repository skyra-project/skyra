import { LanguageKeys } from '#lib/i18n/languageKeys';
import { PaginatedMessageCommand, UserPaginatedMessage } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import type { Reddit } from '#lib/types/definitions/Reddit';
import { fetch, FetchResultTypes, sendLoadingMessage } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { Args } from '@sapphire/framework';
import { cutText, roundNumber } from '@sapphire/utilities';
import { Collection, MessageEmbed } from 'discord.js';
import { decode } from 'he';
import type { TFunction } from 'i18next';

const kUserNameRegex = /^(?:\/?u\/)?[A-Za-z0-9_-]*$/;

@ApplyOptions<PaginatedMessageCommand.Options>({
	aliases: ['redditor'],
	cooldown: 10,
	description: LanguageKeys.Commands.Misc.RedditUserDescription,
	extendedHelp: LanguageKeys.Commands.Misc.RedditUserExtended
})
export class UserPaginatedMessageCommand extends PaginatedMessageCommand {
	public async run(message: GuildMessage, args: PaginatedMessageCommand.Args) {
		const user = await args.pick(UserPaginatedMessageCommand.redditUser);
		const { t } = args;
		const response = await sendLoadingMessage(message, t);

		const [about, comments, posts] = await this.fetchData(user, t);
		if (!about || !comments || !posts || !comments.length || !posts.length) this.error(LanguageKeys.Commands.Misc.RedditUserQueryFailed);
		comments.sort((a, b) => b.score - a.score);

		const display = await this.buildDisplay(message, about, comments, posts, t);
		await display.start(response as GuildMessage, message.author);
		return response;
	}

	private async buildDisplay(
		message: GuildMessage,
		about: Reddit.AboutDataElement,
		comments: Reddit.CommentDataElement[],
		posts: Reddit.PostDataElement[],
		t: TFunction
	) {
		const titles = t(LanguageKeys.Commands.Misc.RedditUserTitles);
		const fieldsData = t(LanguageKeys.Commands.Misc.RedditUserData, {
			user: about.name,
			timestamp: about.created * 1000
		});
		const [bestComment] = comments;
		const worstComment = comments[comments.length - 1];
		const complexity = roundNumber(this.calculateTextComplexity(comments), 2);
		const complexityLevels = t(LanguageKeys.Commands.Misc.RedditUserComplexityLevels);

		return new UserPaginatedMessage({
			template: new MessageEmbed()
				.setTitle(fieldsData.overviewFor)
				.setURL(`https://www.reddit.com${about.subreddit.url}`)
				.setColor(await this.context.db.fetchColor(message))
				.setThumbnail(about.icon_img)
				.setFooter(` • ${fieldsData.dataAvailableFor}`)
		})
			.addPageEmbed((embed) =>
				embed
					.setDescription(fieldsData.joinedReddit)
					.addField(titles.linkKarma, about.link_karma, true)
					.addField(titles.commentKarma, about.comment_karma, true)
					.addField(titles.totalComments, comments.length, true)
					.addField(titles.totalSubmissions, posts.length, true)
					.addField(titles.commentControversiality, `${roundNumber(this.calculateControversiality(comments), 1)}%`, true)
					.addField(titles.textComplexity, `${complexityLevels[Math.floor(complexity / 20)]} (${roundNumber(complexity, 1)}%)`, true)
			)
			.addPageEmbed((embed) =>
				embed
					.addField(`${titles.top5Subreddits} (${titles.bySubmissions})`, this.calculateTopContribution(posts), true)
					.addField(`${titles.top5Subreddits} (${titles.byComments})`, this.calculateTopContribution(comments), true)
			)
			.addPageEmbed((embed) =>
				embed
					.addField(
						`__${titles.bestComment}__`,
						cutText(
							[
								`/r/${bestComment.subreddit} ❯ **${bestComment.score}**`,
								`${t(LanguageKeys.Globals.DurationValue, { value: Date.now() - bestComment.created * 1000 })} ago`,
								`[${fieldsData.permalink}](https://reddit.com${bestComment.permalink})`,
								decode(bestComment.body)
							].join('\n'),
							1020
						)
					)
					.addField(
						`__${titles.worstComment}__`,
						cutText(
							[
								`/r/${worstComment.subreddit} ❯ **${worstComment.score}**`,
								`${t(LanguageKeys.Globals.DurationValue, { value: Date.now() - worstComment.created * 1000 })} ago`,
								`[${fieldsData.permalink}](https://reddit.com${worstComment.permalink})`,
								decode(worstComment.body)
							].join('\n'),
							1020
						)
					)
			);
	}

	private async fetchData(user: string, t: TFunction) {
		return Promise.all([this.fetchAbout(user), this.fetchComments(user, t), this.fetchPosts(user, t)]);
	}

	private async fetchAbout(user: string) {
		const { data } = await fetch<Reddit.Response<'about'>>(`https://www.reddit.com/user/${user}/about/.json`, FetchResultTypes.JSON).catch(() => {
			this.error(LanguageKeys.Commands.Misc.RedditUserQueryFailed);
		});
		return data;
	}

	/**
	 * Fetches comments from the Reddit API
	 * This is a recursive function as Reddit API can only give comments in sets of 100 with a maximum of 1000
	 * @param user The reddit user to get comments for
	 * @param message The discord message that triggered this command
	 * @param after Recursive parameter, determines after which comment to start fetching
	 * @param dataElements Recursive parameter, the previously fetched comments to retain a total
	 */
	private async fetchComments(user: string, t: TFunction, after = '', dataElements: Reddit.CommentDataElement[] = []) {
		const url = new URL(`https://www.reddit.com/user/${user}/comments.json`);
		url.searchParams.append('after', after);
		url.searchParams.append('limit', '100');

		const { data } = await fetch<Reddit.Response<'comments'>>(url, FetchResultTypes.JSON).catch(() => {
			this.error(LanguageKeys.Commands.Misc.RedditUserQueryFailed);
		});

		for (const child of data.children) {
			dataElements.push(child.data);
		}

		if (data.children.length === 100) await this.fetchComments(user, t, data.children[99].data.name, dataElements);

		return dataElements;
	}

	/**
	 * Fetches posts from the Reddit API
	 * This is a recursive function as Reddit API can only give posts in sets of 100
	 * @param user The reddit user to get posts for
	 * @param message The discord message that triggered this command
	 * @param after Recursive parameter, determines after which post to start fetching
	 * @param dataElements Recursive parameter, the previously fetched posts to retain a total
	 */
	private async fetchPosts(user: string, t: TFunction, after = '', dataElements: Reddit.PostDataElement[] = []) {
		const url = new URL(`https://www.reddit.com/user/${user}/submitted.json`);
		url.searchParams.append('after', after);
		url.searchParams.append('limit', '100');

		const { data } = await fetch<Reddit.Response<'posts'>>(url, FetchResultTypes.JSON).catch(() => {
			this.error(LanguageKeys.Commands.Misc.RedditUserQueryFailed);
		});

		for (const child of data.children) {
			dataElements.push(child.data);
		}

		if (data.children.length === 100) await this.fetchPosts(user, t, data.children[99].data.name, dataElements);

		return dataElements;
	}

	/**
	 * Calculated the controversiality based on whether the Reddit has marked a comment controversial
	 * Controversial posts or comments have very even amounts of up/downvotes and a lot of activity.
	 * @param comments The reddit comments to take into the calculation
	 */
	private calculateControversiality(comments: Reddit.CommentDataElement[]) {
		if (!comments.length || comments.length < 5) return 0;
		let count = 0;

		for (const comment of comments) {
			if (comment.controversiality === 1) count++;
		}

		return (count / comments.length) * 100;
	}

	/**
	 * Calculates text readability using the Flesch-Kincaid grading level algorithm.
	 * For more information see: https://en.wikipedia.org/wiki/Flesch–Kincaid_readability_tests#Flesch–Kincaid_grade_level
	 * @param sentences The amount of sentences
	 * @param words The amount of words
	 * @param syllables The amount of syllables
	 */
	private calculateKincaid(sentences: number, words: number, syllables: number) {
		const sentenceWeight = 0.39;
		const wordWeight = 11.8;
		const adjustment = 15.59;

		return sentenceWeight * (words / sentences) + wordWeight * (syllables / words) - adjustment;
	}

	/**
	 * Calculates the amount of syllables in a word, used by {@link calculateKincaid}
	 * For information on how the syllables on counted see: {@link https://stackoverflow.com/a/28385325/9635150}
	 * @param word The word for which to count the amount of syllables
	 */
	private calculateSyllables(word: string) {
		word = word.toLowerCase(); // Transform the word to lowercase for proper analyzing
		if (word.length <= 3) return 1; // If word has a length of 3 or smaller it will always only have 1 syllable
		const syl = word
			.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '')
			.replace(/^y/, '')
			.match(/[aeiouy]{1,2}/g);

		return syl ? syl.length : 1;
	}

	/**
	 * Calculates text complexity using the Flesch-Kincaid algorithm.
	 * First extracts the amount of sentences, words and syllables from a comment
	 * then passes it to {@link calculateKincaid} to calculate the text complexity
	 * @param comments The comments to analyze
	 */
	private calculateTextComplexity(comments: Reddit.CommentDataElement[]) {
		let sentenceCount = 0;
		let syllableCount = 0;
		let wordCount = 0;

		for (const comment of comments) {
			const sentences = comment.body.split(/[.!?]+/gm);
			const words = comment.body.trim().split(/\s+/gm);

			sentenceCount += sentences.length - 1;
			wordCount += words.length;

			for (const syllable of words) {
				syllableCount += this.calculateSyllables(syllable.toLowerCase());
			}
		}

		return this.calculateKincaid(sentenceCount, wordCount, syllableCount);
	}

	private calculateTopContribution(contributions: Reddit.PostDataElement[] | Reddit.CommentDataElement[]) {
		const subreddits = new Collection<string, { name: string; count: number }>();

		for (const contribution of contributions) {
			const count = (subreddits.get(contribution.subreddit)?.count ?? 0) + 1;
			subreddits.set(contribution.subreddit, { name: contribution.subreddit, count });
		}

		subreddits.sort((a, b) => b.count - a.count);

		return subreddits
			.first(5)
			.map((subreddit, index) => `**${index + 1}:** [/r/${subreddit.name}](https://wwww.reddit.com/r/${subreddit.name}) (${subreddit.count})`)
			.join('\n');
	}

	private static redditUser = Args.make<string>((parameter, { argument }) => {
		if (!kUserNameRegex.test(parameter)) {
			return Args.error({ parameter, argument, identifier: LanguageKeys.Commands.Misc.RedditUserInvalidUser, context: { user: parameter } });
		}

		return Args.ok(parameter.replace(/^\/?u\//, ''));
	});
}
