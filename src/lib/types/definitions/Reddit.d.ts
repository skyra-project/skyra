export namespace Reddit {
	export interface Response<K extends 'comments' | 'posts' | 'about'> {
		kind: string;
		data: K extends 'about' ? AboutDataElement : Data<Exclude<K, 'about'>>;
	}

	export interface Data<K extends 'comments' | 'posts'> {
		modhash: string;
		dist: number;
		children: Child<K>[];
		after: string;
		before: null;
	}

	export interface Child<K extends 'comments' | 'posts'> {
		kind: Kind;
		data: K extends 'comments' ? CommentDataElement : PostDataElement;
	}

	export interface CommentDataElement {
		all_awardings: unknown[];
		approved_at_utc: unknown;
		approved_by: unknown;
		archived: boolean;
		author_flair_background_color: string;
		author_flair_css_class: string;
		author_flair_richtext: AuthorFlairRichtext[];
		author_flair_template_id: unknown;
		author_flair_text_color: string;
		author_flair_text: string;
		author_flair_type: string;
		author_fullname: string;
		author_patreon_flair: boolean;
		author: string;
		banned_at_utc: unknown;
		banned_by: unknown;
		body_html: string;
		body: string;
		can_gild: boolean;
		can_mod_post: boolean;
		collapsed_reason: unknown;
		collapsed: boolean;
		controversiality: number;
		created_utc: number;
		created: number;
		distinguished: unknown;
		downs: number;
		edited: boolean;
		gilded: number;
		gildings: unknown;
		id: string;
		is_submitter: boolean;
		likes: unknown;
		link_author: string;
		link_id: string;
		link_permalink: string;
		link_title: string;
		link_url: string;
		locked: boolean;
		mod_note: unknown;
		mod_reason_by: unknown;
		mod_reason_title: unknown;
		mod_reports: unknown[];
		name: string;
		no_follow: boolean;
		num_comments: number;
		num_reports: unknown;
		over_18: boolean;
		parent_id: string;
		permalink: string;
		quarantine: boolean;
		removal_reason: unknown;
		replies: string;
		report_reasons: unknown;
		saved: boolean;
		score_hidden: boolean;
		score: 1;
		send_replies: boolean;
		stickied: boolean;
		subreddit_id: string;
		subreddit_name_prefixed: string;
		subreddit_type: string;
		subreddit: string;
		total_awards_received: number;
		ups: number;
		user_reports: unknown[];
	}

	export interface PostDataElement {
		all_awardings: any[];
		allow_live_comments: boolean;
		approved_at_utc: null;
		approved_by: null;
		archived: boolean;
		author_flair_background_color: null;
		author_flair_css_class: null | string;
		author_flair_richtext: AuthorFlairRichtext[];
		author_flair_template_id: null | string;
		author_flair_text_color: FlairTextColor | null;
		author_flair_text: null | string;
		author_flair_type: AuthorFlairType;
		author_fullname: string;
		author_patreon_flair: boolean;
		author: string;
		awarders: any[];
		banned_at_utc: null;
		banned_by: null;
		can_gild: boolean;
		can_mod_post: boolean;
		category: null;
		clicked: boolean;
		content_categories: null;
		contest_mode: boolean;
		created_utc: number;
		created: number;
		crosspost_parent_list?: PostDataElement[];
		crosspost_parent?: string;
		discussion_type: null;
		distinguished: null | string;
		domain: string;
		downs: number;
		edited: boolean;
		gilded: number;
		gildings: Gildings;
		hidden: boolean;
		hide_score: boolean;
		id: string;
		is_crosspostable: boolean;
		is_meta: boolean;
		is_original_content: boolean;
		is_reddit_media_domain: boolean;
		is_robot_indexable: boolean;
		is_self: boolean;
		is_video: boolean;
		likes: null;
		link_flair_background_color: string;
		link_flair_css_class: null;
		link_flair_richtext: any[];
		link_flair_text_color: FlairTextColor;
		link_flair_text: null;
		link_flair_type: AuthorFlairType;
		locked: boolean;
		media_embed: Gildings;
		media_only: boolean;
		media: null;
		mod_note: null;
		mod_reason_by: null;
		mod_reason_title: null;
		mod_reports: any[];
		name: string;
		no_follow: boolean;
		num_comments: number;
		num_crossposts: number;
		num_reports: null;
		over_18: boolean;
		parent_whitelist_status: null | string;
		permalink: string;
		pinned: boolean;
		post_hint: PostHint;
		preview: Preview;
		pwls: number | null;
		quarantine: boolean;
		removal_reason: null;
		report_reasons: null;
		saved: boolean;
		score: number;
		secure_media_embed: Gildings;
		secure_media: null;
		selftext_html: null;
		selftext: string;
		send_replies: boolean;
		spoiler: boolean;
		steward_reports: any[];
		stickied: boolean;
		subreddit_id: string;
		subreddit_name_prefixed: string;
		subreddit_subscribers: number;
		subreddit_type: SubredditType;
		subreddit: string;
		suggested_sort: null;
		thumbnail_height: number;
		thumbnail_width: number;
		thumbnail: string;
		title: string;
		total_awards_received: number;
		ups: number;
		url: string;
		user_reports: any[];
		view_count: null;
		visited: boolean;
		whitelist_status: null | string;
		wls: number | null;
	}

	export interface AboutDataElement {
		comment_karma: number;
		created_utc: number;
		created: number;
		has_subscribed: boolean;
		has_verified_email: boolean;
		hide_from_robots: boolean;
		icon_img: string;
		id: string;
		is_employee: boolean;
		is_friend: boolean;
		is_gold: boolean;
		is_mod: boolean;
		link_karma: number;
		name: string;
		pref_show_snoovatar: boolean;
		subreddit: UserSubreddit;
		verified: boolean;
	}

	export interface AuthorFlairRichtext {
		e: AuthorFlairType;
		t: string;
	}

	export enum AuthorFlairType {
		Richtext = 'richtext',
		Text = 'text'
	}

	export enum FlairTextColor {
		Dark = 'dark'
	}

	export interface Gildings {}

	export enum PostHint {
		Link = 'link'
	}

	export interface Preview {
		images: Image[];
		enabled: boolean;
	}

	export interface Image {
		source: Source;
		resolutions: Source[];
		variants: Gildings;
		id: string;
	}

	export interface Source {
		url: string;
		width: number;
		height: number;
	}

	export interface UserSubreddit {
		banner_img: string;
		community_icon: string;
		default_set: boolean;
		description: string;
		display_name: string;
		free_form_reports: boolean;
		header_img: null;
		header_size: null;
		icon_color: string;
		icon_img: string;
		iconSize: unknown[];
		over_18: boolean;
		primary_color: string;
		restrict_commenting: boolean;
		restrict_posting: boolean;
		show_media: boolean;
		submit_link_label: string;
		submit_text_label: string;
		subscribers: number;
		title: string;
		user_is_banned: null;
		user_is_contributor: null;
		user_is_muted: null;
		banner_size?: null;
		disable_contributor_requests: boolean;
		display_name_prefixed: string;
		is_default_banner: boolean;
		is_default_icon: boolean;
		key_color: string;
		link_flair_enabled: boolean;
		link_flair_position: string;
		name: string;
		public_description: string;
		subreddit_type: string;
		url: string;
		user_is_moderator?: null;
		user_is_subscriber?: null;
	}

	export enum SubredditType {
		Public = 'public',
		Restricted = 'restricted'
	}

	export enum Kind {
		T3 = 't3'
	}
}
