export namespace Reddit {
	export interface Response<K extends 'comments' | 'posts' | 'about'> {
		kind: string;
		data: K extends 'about' ? AboutDataElement : Data<Exclude<K, 'about'>>;
	}

	export interface Data<K extends 'comments' | 'posts'> {
		after: string;
		before: null;
		children: Child<K>[];
		dist: number;
		modhash: string;
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
		associated_award: null;
		author: string;
		author_flair_background_color: string | null;
		author_flair_css_class: string | null;
		author_flair_richtext: FlairRichtext[];
		author_flair_template_id: unknown | null;
		author_flair_text: string | null;
		author_flair_text_color: string | null;
		author_flair_type: string;
		author_fullname: string;
		author_patreon_flair: boolean;
		author_premium: boolean;
		banned_at_utc: unknown;
		banned_by: unknown;
		body: string;
		body_html: string;
		can_gild: boolean;
		can_mod_post: boolean;
		collapsed: boolean;
		collapsed_because_crowd_control: unknown;
		collapsed_reason: unknown;
		comment_type: null;
		controversiality: number;
		created: number;
		created_utc: number;
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
		score: number;
		score_hidden: boolean;
		send_replies: boolean;
		stickied: boolean;
		subreddit: string;
		subreddit_id: string;
		subreddit_name_prefixed: string;
		subreddit_type: string;
		top_awarded_type: null;
		total_awards_received: number;
		treatment_tags: unknown[];
		ups: number;
		user_reports: unknown[];
	}

	export interface PostDataElement {
		all_awardings: any[];
		allow_live_comments: boolean;
		approved_at_utc: null;
		approved_by: null;
		archived: boolean;
		author: string;
		author_flair_background_color: string | null;
		author_flair_css_class: string | null;
		author_flair_richtext: FlairRichtext[];
		author_flair_template_id: string | null;
		author_flair_text: string | null;
		author_flair_text_color: FlairTextColor | null;
		author_flair_type: FlairType;
		author_fullname: string;
		author_patreon_flair: boolean;
		author_premium: boolean;
		awarders: unknown[];
		banned_at_utc: null;
		banned_by: null;
		can_gild: boolean;
		can_mod_post: boolean;
		category: null;
		clicked: boolean;
		content_categories: null;
		contest_mode: boolean;
		created: number;
		created_utc: number;
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
		link_flair_richtext: FlairRichtext[];
		link_flair_template_id: string;
		link_flair_text: null;
		link_flair_text_color: FlairTextColor;
		link_flair_type: FlairType;
		locked: boolean;
		media: null;
		media_embed: Gildings;
		media_only: boolean;
		mod_note: null;
		mod_reason_by: null;
		mod_reason_title: null;
		mod_reports: unknown[];
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
		removed_by: null;
		removed_by_category: string;
		report_reasons: null;
		saved: boolean;
		score: number;
		secure_media: null;
		secure_media_embed: Gildings;
		selftext: string;
		selftext_html: null;
		send_replies: boolean;
		spoiler: boolean;
		stickied: boolean;
		subreddit: string;
		subreddit_id: string;
		subreddit_name_prefixed: string;
		subreddit_subscribers: number;
		subreddit_type: SubredditType;
		suggested_sort: null;
		thumbnail: string;
		thumbnail_height: number;
		thumbnail_width: number;
		title: string;
		top_awarded_type: null;
		total_awards_received: number;
		treatment_tags: unknown[];
		ups: number;
		upvote_ratio: number;
		url: string;
		url_overridden_by_dest: string;
		user_reports: unknown[];
		view_count: null;
		visited: boolean;
		whitelist_status: null | string;
		wls: number | null;
	}

	export interface AboutDataElement {
		awardee_karma: number;
		awarder_karma: number;
		comment_karma: number;
		created: number;
		created_utc: number;
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
		snoovatar_img: string;
		snoovatar_size: number | null;
		subreddit: UserSubreddit;
		total_karma: number;
		verified: boolean;
	}

	export interface FlairRichtext {
		e: FlairType;
		t: string;
	}

	export enum FlairType {
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
		banner_size: number[];
		community_icon: string | null;
		default_set: boolean;
		description: string;
		disable_contributor_requests: boolean;
		display_name: string;
		display_name_prefixed: string;
		free_form_reports: boolean;
		header_img: null;
		header_size: null;
		icon_color: string;
		icon_img: string;
		icon_size: number[];
		is_default_banner: boolean;
		is_default_icon: boolean;
		key_color: string;
		link_flair_enabled: boolean;
		link_flair_position: string;
		name: string;
		over_18: boolean;
		previous_names: string[];
		primary_color: string;
		public_description: string;
		restrict_commenting: boolean;
		restrict_posting: boolean;
		show_media: boolean;
		submit_link_label: string;
		submit_text_label: string;
		subreddit_type: string;
		subscribers: number;
		title: string;
		url: string;
		user_is_banned: null;
		user_is_contributor: null;
		user_is_moderator: null;
		user_is_muted: null;
		user_is_subscriber: null;
	}

	export enum SubredditType {
		Public = 'public',
		Restricted = 'restricted'
	}

	export enum Kind {
		T3 = 't3'
	}
}
