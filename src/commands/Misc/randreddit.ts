import { CommandStore, KlasaMessage } from 'klasa';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { fetch } from '../../lib/util/util';
import { TextChannel } from 'discord.js';

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
		const { kind, data } = await fetch(`https://www.reddit.com/r/${reddit}/.json?limit=30`, 'json') as RedditResponse;

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

interface RedditResponse {
	kind: string;
	data: RedditData;
}

interface RedditData {
	modhash: string;
	dist: number;
	children: Child[];
	after: string;
	before: null;
}

interface Child {
	kind: Kind;
	data: DataElement;
}

interface DataElement {
	approved_at_utc: null;
	subreddit: string;
	selftext: string;
	author_fullname: string;
	saved: boolean;
	mod_reason_title: null;
	gilded: number;
	clicked: boolean;
	title: string;
	link_flair_richtext: any[];
	subreddit_name_prefixed: string;
	hidden: boolean;
	pwls: number | null;
	link_flair_css_class: null;
	downs: number;
	thumbnail_height: number;
	hide_score: boolean;
	name: string;
	quarantine: boolean;
	link_flair_text_color: FlairTextColor;
	author_flair_background_color: null;
	subreddit_type: SubredditType;
	ups: number;
	total_awards_received: number;
	media_embed: Gildings;
	thumbnail_width: number;
	author_flair_template_id: null | string;
	is_original_content: boolean;
	user_reports: any[];
	secure_media: null;
	is_reddit_media_domain: boolean;
	is_meta: boolean;
	category: null;
	secure_media_embed: Gildings;
	link_flair_text: null;
	can_mod_post: boolean;
	score: number;
	approved_by: null;
	thumbnail: string;
	edited: boolean;
	author_flair_css_class: null | string;
	steward_reports: any[];
	author_flair_richtext: AuthorFlairRichtext[];
	gildings: Gildings;
	post_hint: PostHint;
	content_categories: null;
	is_self: boolean;
	mod_note: null;
	created: number;
	link_flair_type: AuthorFlairType;
	wls: number | null;
	banned_by: null;
	author_flair_type: AuthorFlairType;
	domain: string;
	allow_live_comments: boolean;
	selftext_html: null;
	likes: null;
	suggested_sort: null;
	banned_at_utc: null;
	view_count: null;
	archived: boolean;
	no_follow: boolean;
	is_crosspostable: boolean;
	pinned: boolean;
	over_18: boolean;
	preview: Preview;
	all_awardings: any[];
	awarders: any[];
	media_only: boolean;
	can_gild: boolean;
	spoiler: boolean;
	locked: boolean;
	author_flair_text: null | string;
	visited: boolean;
	num_reports: null;
	distinguished: null | string;
	subreddit_id: string;
	mod_reason_by: null;
	removal_reason: null;
	link_flair_background_color: string;
	id: string;
	is_robot_indexable: boolean;
	report_reasons: null;
	author: string;
	discussion_type: null;
	num_comments: number;
	send_replies: boolean;
	whitelist_status: null | string;
	contest_mode: boolean;
	mod_reports: any[];
	author_patreon_flair: boolean;
	author_flair_text_color: FlairTextColor | null;
	permalink: string;
	parent_whitelist_status: null | string;
	stickied: boolean;
	url: string;
	subreddit_subscribers: number;
	created_utc: number;
	num_crossposts: number;
	media: null;
	is_video: boolean;
	crosspost_parent_list?: DataElement[];
	crosspost_parent?: string;
}

interface AuthorFlairRichtext {
	e: AuthorFlairType;
	t: string;
}

enum AuthorFlairType {
	Richtext = 'richtext',
	Text = 'text',
}

enum FlairTextColor {
	Dark = 'dark',
}

interface Gildings {}

enum PostHint {
	Link = 'link',
}

interface Preview {
	images: Image[];
	enabled: boolean;
}

interface Image {
	source: Source;
	resolutions: Source[];
	variants: Gildings;
	id: string;
}

interface Source {
	url: string;
	width: number;
	height: number;
}

enum SubredditType {
	Public = 'public',
	Restricted = 'restricted',
}

enum Kind {
	T3 = 't3',
}
