// NOTICE: This type represents a standard Iso date string
export type IsoDate = string;
export type UUID = string;

export interface MixerTimeStamped {
	createdAt: IsoDate;
	updatedAt: IsoDate;
	deletedAt?: IsoDate;
}

export interface MixerResource {
	id: number;
	type: string;
	relid: number;
	url: string;
	store: string;
	remotePath: string;
	meta?: unknown;
}

export interface MixerChannelPreferences {
	sharetext?: string;
	'channel:links:allowed'?: boolean;
	'channel:links:clickable'?: boolean;
	'channel:slowchat'?: number;
	'channel:notify:directPurchaseMessage'?: string;
	'channel:notify:subscribemessage'?: string;
	'channel:notify:subscribe'?: boolean;
	'channel:notify:followmessage'?: string;
	'channel:notify:follow'?: boolean;
	'channel:notify:hostedBy'?: string;
	'channel:notify:hosting'?: string;
	'channel:partner:submail'?: string;
	'channel:player:muteOwn'?: boolean;
	'channel:tweet:enabled'?: boolean;
	'channel:tweet:body'?: string;
	'hypezone:allow': boolean;
	'hosting:allow': boolean;
	'costream:allow': boolean;
	'channel:offline:autoplayVod'?: boolean;
}

export interface SocialInfo {
	twitter: string;
	facebook: string;
	youtube: string;
	player: string;
	discord: string;
	verified: string[];
}

export const enum MixerRole {
	User = 'User',
	Banned = 'Banned',
	Pro = 'Pro',
	VerifiedPartner = 'VerifiedPartner',
	Partner = 'Partner',
	Subscriber = 'Subscriber',
	ChannelEditor = 'ChannelEditor',
	Mod = 'Mod',
	GlobalMod = 'GlobalMod',
	Staff = 'Staff',
	Founder = 'Founder',
	Owner = 'Owner'
}

export const enum Audience {
	Family = 'family',
	Teen = 'teen',
	MaturePlus = '18+'
}

export interface MixerUser extends MixerTimeStamped {
	id: number;
	level: number;
	social?: SocialInfo;
	username: string;
	email?: string;
	verified: boolean;
	experience: number;
	sparks: number;
	avatarUrl?: string;
	bio?: string;
	primaryTeam?: number;
}

export interface MixerUserGroup extends MixerTimeStamped {
	id: number;
	name: MixerRole;
}

export interface MixerUserWithGroups extends MixerUser {
	groups: MixerUserGroup[];
}

export interface MixerGameTypeSimple {
	id: number;
	name: string;
	coverUrl?: string;
	backgroundUrl?: string;
}

export interface MixerGameType extends MixerGameTypeSimple {
	parent: string;
	description: string;
	source: string;
	viewersCurrent: number;
	online: number;
}

export interface MixerChannel extends MixerTimeStamped {
	id: number;
	userId: number;
	token: string;
	online: boolean;
	featured: boolean;
	featureLevel: number;
	partnered: boolean;
	transcodingProfileId?: number;
	suspended: boolean;
	name: string;
	audience: Audience;
	viewersTotal: number;
	viewersCurrent: number;
	numFollowers: number;
	description: string;
	typeId?: number;
	interactive: boolean;
	interactiveGameId?: number;
	ftl: number;
	hasVod: boolean;
	languageId?: string;
	coverId?: number;
	thumbnailId?: number;
	badgeId: number;
	bannerUrl: string;
	hosteeId: number;
	hasTranscodes: boolean;
	vodsEnabled: boolean;
	costreamId?: UUID;
}

export interface MixerChannelAdvanced extends MixerChannel {
	type?: MixerGameType;
	user: MixerUserWithGroups;
}

export interface MixerExpandedChannel extends MixerChannelAdvanced {
	thumbnail?: MixerResource;
	cover?: MixerResource;
	badge?: MixerResource;
	cache: unknown[];
	preferences: MixerChannelPreferences;
}

export interface MixerUserWithChannel extends MixerUser {
	channel: MixerChannel;
}
