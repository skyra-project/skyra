import { DbSet } from '@lib/database';
import { RichDisplayCommand, RichDisplayCommandOptions } from '@lib/structures/RichDisplayCommand';
import { UserRichDisplay } from '@lib/structures/UserRichDisplay';
import { Reddit } from '@lib/types/definitions/Reddit';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { cutText, roundNumber } from '@sapphire/utilities';
import { ApplyOptions } from '@skyra/decorators';
import { BrandingColors } from '@utils/constants';
import { fetch, FetchResultTypes, pickRandom } from '@utils/util';
import { Collection, MessageEmbed } from 'discord.js';
import { decode } from 'he';
import { KlasaMessage, Language, Timestamp } from 'klasa';

@ApplyOptions<RichDisplayCommandOptions>({
	aliases: ['redditor'],
	cooldown: 10,
	description: (language) => language.get(LanguageKeys.Commands.Misc.RedditUserDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Misc.RedditUserExtended),
	usage: '<user:user>'
})
export default class extends RichDisplayCommand {
	private joinedRedditTimestamp = new Timestamp('MMMM d YYYY');
	private usernameRegex = /^(?:\/?u\/)?[A-Za-z0-9_-]*$/;

	public async init() {
		this.createCustomResolver('user', async (arg, _possible, message) => {
			if (!this.usernameRegex.test(arg)) throw await message.fetchLocale(LanguageKeys.Commands.Misc.RedditUserInvalidUser, { user: arg });
			arg = arg.replace(/^\/?u\//, '');
			return arg;
		});
	}

	public async run(message: KlasaMessage, [user]: [string]) {
		const language = await message.fetchLanguage();
		const response = await message.sendEmbed(
			new MessageEmbed().setDescription(pickRandom(language.get(LanguageKeys.System.Loading))).setColor(BrandingColors.Secondary)
		);

		const [about, comments, posts] = await this.fetchData(user, language);
		if (!about || !comments || !posts || !comments.length || !posts.length) throw language.get(LanguageKeys.Commands.Misc.RedditUserQueryFailed);
		comments.sort((a, b) => b.score - a.score);

		const display = await this.buildDisplay(message, about, comments, posts, language);
		await display.start(response, message.author.id);
		return response;
	}

	private async buildDisplay(
		message: KlasaMessage,
		about: Reddit.AboutDataElement,
		comments: Reddit.CommentDataElement[],
		posts: Reddit.PostDataElement[],
		language: Language
	) {
		const titles = language.get(LanguageKeys.Commands.Misc.RedditUserTitles);
		const fieldsData = language.get(LanguageKeys.Commands.Misc.RedditUserData, {
			user: about.name,
			timestamp: this.joinedRedditTimestamp.displayUTC(about.created * 1000)
		});
		const [bestComment] = comments;
		const worstComment = comments[comments.length - 1];
		const complexity = roundNumber(this.calculateTextComplexity(comments), 2);
		const complexityLevels = language.get(LanguageKeys.Commands.Misc.RedditUserComplexityLevels);

		return new UserRichDisplay(
			new MessageEmbed()
				.setTitle(fieldsData.overviewFor)
				.setURL(`https://www.reddit.com${about.subreddit.url}`)
				.setColor(await DbSet.fetchColor(message))
				.setThumbnail(about.icon_img)
		)
			.addPage((embed: MessageEmbed) =>
				embed
					.setDescription(fieldsData.joinedReddit)
					.addField(titles.linkKarma, about.link_karma, true)
					.addField(titles.commentKarma, about.comment_karma, true)
					.addField(titles.totalComments, comments.length, true)
					.addField(titles.totalSubmissions, posts.length, true)
					.addField(titles.commentControversiality, `${roundNumber(this.calculateControversiality(comments), 1)}%`, true)
					.addField(titles.textComplexity, `${complexityLevels[Math.floor(complexity / 20)]} (${roundNumber(complexity, 1)}%)`, true)
			)
			.addPage((embed: MessageEmbed) =>
				embed
					.addField(`${titles.top5Subreddits} (${titles.bySubmissions})`, this.calculateTopContribution(posts), true)
					.addField(`${titles.top5Subreddits} (${titles.byComments})`, this.calculateTopContribution(comments), true)
			)
			.addPage((embed: MessageEmbed) =>
				embed
					.addField(
						`__${titles.bestComment}__`,
						cutText(
							[
								`/r/${bestComment.subreddit} ❯ **${bestComment.score}**`,
								`${language.duration(Date.now() - bestComment.created * 1000, 3)} ago`,
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
								`${language.duration(Date.now() - worstComment.created * 1000, 3)} ago`,
								`[${fieldsData.permalink}](https://reddit.com${worstComment.permalink})`,
								decode(worstComment.body)
							].join('\n'),
							1020
						)
					)
			)
			.setFooterSuffix(` • ${fieldsData.dataAvailableFor}`);
	}

	private async fetchData(user: string, language: Language) {
		return Promise.all([this.fetchAbout(user, language), this.fetchComments(user, language), this.fetchPosts(user, language)]);
	}

	private async fetchAbout(user: string, language: Language) {
		const { data } = await fetch<Reddit.Response<'about'>>(`https://www.reddit.com/user/${user}/about/.json`, FetchResultTypes.JSON).catch(() => {
			throw language.get(LanguageKeys.Commands.Misc.RedditUserQueryFailed);
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
	private async fetchComments(user: string, language: Language, after = '', dataElements: Reddit.CommentDataElement[] = []) {
		const url = new URL(`https://www.reddit.com/user/${user}/comments.json`);
		url.searchParams.append('after', after);
		url.searchParams.append('limit', '100');

		const { data } = await fetch<Reddit.Response<'comments'>>(url, FetchResultTypes.JSON).catch(() => {
			throw language.get(LanguageKeys.Commands.Misc.RedditUserQueryFailed);
		});

		for (const child of data.children) {
			dataElements.push(child.data);
		}

		if (data.children.length === 100) await this.fetchComments(user, language, data.children[99].data.name, dataElements);

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
	private async fetchPosts(user: string, language: Language, after = '', dataElements: Reddit.PostDataElement[] = []) {
		const url = new URL(`https://www.reddit.com/user/${user}/submitted.json`);
		url.searchParams.append('after', after);
		url.searchParams.append('limit', '100');

		const { data } = await fetch<Reddit.Response<'posts'>>(url, FetchResultTypes.JSON).catch(() => {
			throw language.get(LanguageKeys.Commands.Misc.RedditUserQueryFailed);
		});

		for (const child of data.children) {
			dataElements.push(child.data);
		}

		if (data.children.length === 100) await this.fetchPosts(user, language, data.children[99].data.name, dataElements);

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
}
