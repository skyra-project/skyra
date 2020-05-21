import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { Reddit } from '@lib/types/definitions/Reddit';
import { BrandingColors } from '@utils/constants';
import { cutText, fetch, FetchResultTypes, getColor, roundNumber } from '@utils/util';
import { Collection, MessageEmbed } from 'discord.js';
import { CommandStore, KlasaMessage, Timestamp } from 'klasa';

export default class extends SkyraCommand {

	private joinedRedditTimestamp = new Timestamp('MMMM d YYYY');
	private usernameRegex = /^(?:\/?u\/)?[A-Za-z0-9_-]*$/;

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['redditor'],
			cooldown: 10,
			description: language => language.tget('COMMAND_REDDITUSER_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_REDDITUSER_EXTENDED'),
			requiredPermissions: ['EMBED_LINKS'],
			usage: '<user:user>'
		});

		this.createCustomResolver('user', (arg, _possible, message) => {
			if (!this.usernameRegex.test(arg)) throw message.language.tget('COMMAND_REDDITUSER_INVALID_USER', arg);
			arg = arg.replace(/^\/?u\//, '');
			return arg;
		});
	}

	public async run(message: KlasaMessage, [user]: [string]) {
		await message.sendEmbed(new MessageEmbed()
			.setDescription(message.language.tget('SYSTEM_LOADING'))
			.setColor(BrandingColors.Secondary));

		const [about, comments, posts] = await this.fetchData(user, message);
		if (!about || !comments || !posts || !comments.length || !posts.length) throw message.language.tget('COMMAND_REDDITUSER_QUERY_FAILED');
		comments.sort((a, b) => b.score - a.score);

		const titles = message.language.tget('COMMAND_REDDITUSER_TITLES');
		const fieldsData = message.language.tget('COMMAND_REDDITUSER_DATA');
		const [bestComment] = comments;
		const worstComment = comments[comments.length - 1];
		const complexity = roundNumber(this.calculateTextComplexity(comments), 2);
		const complexityLevels = message.language.tget('COMMAND_REDDITUSER_COMPLEXITY_LEVELS');

		const embed = new MessageEmbed()
			.setTitle(fieldsData.OVERVIEW_FOR(about.name))
			.setURL(`https://www.reddit.com${about.subreddit.url}`)
			.setColor(getColor(message))
			.setDescription(fieldsData.JOINED_REDDIT(this.joinedRedditTimestamp.displayUTC(about.created)))
			.setThumbnail(about.icon_img)
			.setFooter(fieldsData.DATA_AVAILABLE_FOR)
			.addField(titles.LINK_KARMA, about.link_karma, true)
			.addField(titles.COMMENT_KARMA, about.comment_karma, true)
			.addField(titles.TOTAL_COMMENTS, comments.length, true)
			.addField(titles.TOTAL_SUBMISSIONS, posts.length, true)
			.addField(titles.COMMENT_CONTROVERSIALITY, `${roundNumber(this.calculateControversiality(comments), 1)}%`, true)
			.addField(titles.TEXT_COMPLEXITY, `${complexityLevels[Math.floor(complexity / 20)]} (${roundNumber(complexity, 1)}%)`, true)
			.addField(`${titles.TOP_5_SUBREDDITS} (${titles.BY_SUBMISSIONS})`, this.calculateTopContribution(posts), true)
			.addField(`${titles.TOP_5_SUBREDDITS} (${titles.BY_COMMENTS})`, this.calculateTopContribution(comments), true)
			.addField(titles.BEST_COMMENT,
				[
					`${bestComment.subreddit} - **${bestComment.score}**`,
					`${message.language.duration((Date.now() - bestComment.created) * 1000)} ago`,
					`[${fieldsData.PERMALINK}](https://reddit.com${bestComment.permalink})`,
					cutText(bestComment.body, 900)
				].join('\n'))
			.addField(titles.WORST_COMMENT,
				[
					`${worstComment.subreddit} - **${worstComment.score}**`,
					`${message.language.duration((Date.now() - worstComment.created) * 1000)} ago`,
					`[${fieldsData.PERMALINK}](https://reddit.com${worstComment.permalink})`,
					cutText(worstComment.body, 900)
				].join('\n'));

		return message.sendEmbed(embed);
	}

	private async fetchData(user: string, message: KlasaMessage) {
		return Promise.all([this.fetchAbout(user, message), this.fetchComments(user, message), this.fetchPosts(user, message)]);
	}

	private async fetchAbout(user: string, message: KlasaMessage) {
		const { data } = await fetch<Reddit.Response<'about'>>(`https://www.reddit.com/user/${user}/about/.json`, FetchResultTypes.JSON)
			.catch(() => {
				throw message.language.tget('COMMAND_REDDITUSER_QUERY_FAILED');
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
	private async fetchComments(user: string, message: KlasaMessage, after = '', dataElements: Reddit.CommentDataElement[] = []) {
		const url = new URL(`https://www.reddit.com/user/${user}/comments.json`);
		url.searchParams.append('after', after);
		url.searchParams.append('limit', '100');

		const { data } = await fetch<Reddit.Response<'comments'>>(url, FetchResultTypes.JSON)
			.catch(() => {
				throw message.language.tget('COMMAND_REDDITUSER_QUERY_FAILED');
			});

		for (const child of data.children) {
			dataElements.push(child.data);
		}

		if (data.children.length === 100) await this.fetchComments(user, message, data.children[99].data.name, dataElements);

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
	private async fetchPosts(user: string, message: KlasaMessage, after = '', dataElements: Reddit.PostDataElement[] = []) {
		const url = new URL(`https://www.reddit.com/user/${user}/submitted.json`);
		url.searchParams.append('after', after);
		url.searchParams.append('limit', '100');

		const { data } = await fetch<Reddit.Response<'posts'>>(url, FetchResultTypes.JSON)
			.catch(() => {
				throw message.language.tget('COMMAND_REDDITUSER_QUERY_FAILED');
			});

		for (const child of data.children) {
			dataElements.push(child.data);
		}

		if (data.children.length === 100) await this.fetchPosts(user, message, data.children[99].data.name, dataElements);

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

		return (
			(sentenceWeight * (words / sentences)) +
			(wordWeight * (syllables / words)) -
			adjustment
		);
	}

	/**
	 * Calculates the amount of syllables in a word, used by {@link calculateKincaid}
	 * For information on how the syllables on counted see: {@link https://stackoverflow.com/a/28385325/9635150}
	 * @param word The word for which to count the amount of syllables
	 */
	private calculateSyllables(word: string) {
		word = word.toLowerCase(); // Transform the word to lowercase for proper analyzing
		if (word.length <= 3) return 1; // If word has a length of 3 or smaller it will always only have 1 syllable
		const syl = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '')
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

		return subreddits.first(5).map(
			(subreddit, index) => `**${index + 1}:** [/r/${subreddit.name}](https://wwww.reddit.com/r/${subreddit.name}) (${subreddit.count})`
		).join('\n');
	}

}
