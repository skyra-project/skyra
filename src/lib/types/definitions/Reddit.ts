import type { NonNullObject } from '@sapphire/utilities';

export namespace Reddit {
	export interface Response {
		kind: string;
		data: Data;
	}

	export interface Data {
		after: string;
		before: null;
		children: Child[];
		dist: number;
		modhash: string;
	}

	export interface Child {
		kind: Kind;
		data: PostDataElement;
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
		gildings: NonNullObject;
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
		media_embed: NonNullObject;
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
		secure_media_embed: NonNullObject;
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
		variants: NonNullObject;
		id: string;
	}

	export interface Source {
		url: string;
		width: number;
		height: number;
	}

	export enum SubredditType {
		Public = 'public',
		Restricted = 'restricted'
	}

	export enum Kind {
		T3 = 't3'
	}
}
