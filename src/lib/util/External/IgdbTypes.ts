/**
 * MIT License
 *
 * Copyright (c) 2019 IGDB.com
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/** ApiObject Type, id and other key:value pairs */
interface ApiObject extends Record<string, ApiObjectProperty> {
	id: number;
}

/** Possible types of an ApiObject's properties */
type ApiObjectProperty = ApiObject[] | ApiObject | number[] | number | string | string[] | boolean | undefined;

interface AgeRating extends ApiObject {
	id: number;
	category?: AgeRatingCategoryEnum;
	content_descriptions?: Array<AgeRatingContentDescription> | number[];
	rating?: AgeRatingRatingEnum;
	rating_cover_url?: string;
	synopsis?: string;
}

interface AgeRatingContentDescription extends ApiObject {
	id: number;
	category?: AgeRatingRatingEnum;
	description?: string;
}

interface AlternativeName extends ApiObject {
	id: number;
	comment?: string;
	game?: Game | number;
	name?: string;
}

interface Artwork extends ApiObject {
	id: number;
	alpha_channel?: boolean;
	animated?: boolean;
	game?: Game | number;
	height?: number;
	image_id?: string;
	url?: string;
	width?: number;
}

interface Character extends ApiObject {
	id: number;
	akas?: Array<string> | number[];
	country_name?: string;
	created_at?: number;
	description?: string;
	games?: Array<Game> | number[];
	gender?: GenderGenderEnum;
	mug_shot?: CharacterMugShot | number;
	name?: string;
	people?: Array<Person> | number[];
	slug?: string;
	species?: CharacterSpeciesEnum;
	updated_at?: number;
	url?: string;
}

interface CharacterMugShot extends ApiObject {
	id: number;
	alpha_channel?: boolean;
	animated?: boolean;
	height?: number;
	image_id?: string;
	url?: string;
	width?: number;
}

interface Collection extends ApiObject {
	id: number;
	created_at?: number;
	games?: Array<Game> | number[];
	name?: string;
	slug?: string;
	updated_at?: number;
	url?: string;
}

export interface Company extends ApiObject {
	id: number;
	change_date?: number;
	change_date_category?: DateFormatStartDateCategoryEnum;
	changed_company_id?: Company | number;
	country?: number;
	created_at?: number;
	description?: string;
	developed?: Array<Game> | number[];
	logo?: CompanyLogo | number;
	name?: string;
	parent?: Company | number;
	published?: Array<Game> | number[];
	slug?: string;
	start_date?: number;
	start_date_category?: DateFormatStartDateCategoryEnum;
	updated_at?: number;
	url?: string;
	websites?: Array<CompanyWebsite> | number[];
}

interface CompanyLogo extends ApiObject {
	id: number;
	alpha_channel?: boolean;
	animated?: boolean;
	height?: number;
	image_id?: string;
	url?: string;
	width?: number;
}

interface CompanyWebsite extends ApiObject {
	id: number;
	category?: WebsiteCategoryEnum;
	trusted?: boolean;
	url?: string;
}

interface Cover extends ApiObject {
	id: number;
	alpha_channel?: boolean;
	animated?: boolean;
	game?: Game | number;
	height?: number;
	image_id?: string;
	url?: string;
	width?: number;
}

interface ExternalGame extends ApiObject {
	id: number;
	category?: ExternalGameCategoryEnum;
	created_at?: number;
	game?: Game | number;
	name?: string;
	uid?: string;
	updated_at?: number;
	url?: string;
	year?: number;
}

interface Feed extends ApiObject {
	id: number;
	category?: FeedCategoryEnum;
	content?: string;
	created_at?: number;
	feed_likes_count?: number;
	feed_video?: GameVideo | number;
	games?: Array<Game> | number[];
	meta?: string;
	published_at?: number;
	pulse?: Pulse | number;
	slug?: string;
	title?: string;
	uid?: string;
	updated_at?: number;
	url?: string;
	user?: number;
}

interface Franchise extends ApiObject {
	id: number;
	created_at?: number;
	games?: Array<Game> | number[];
	name?: string;
	slug?: string;
	updated_at?: number;
	url?: string;
}

export interface Game extends ApiObject {
	id: number;
	age_ratings?: Array<AgeRating> | number[];
	aggregated_rating?: number;
	aggregated_rating_count?: number;
	alternative_names?: Array<AlternativeName> | number[];
	artworks?: Array<Artwork> | number[];
	bundles?: Array<Game> | number[];
	category?: GameCategoryEnum;
	collection?: Collection | number;
	cover?: Cover | number;
	created_at?: number;
	dlcs?: Array<Game> | number[];
	expansions?: Array<Game> | number[];
	external_games?: Array<ExternalGame> | number[];
	first_release_date?: number;
	follows?: number;
	franchise?: Franchise | number;
	franchises?: Array<Franchise> | number[];
	game_engines?: Array<GameEngine> | number[];
	game_modes?: Array<GameMode> | number[];
	genres?: Array<Genre> | number[];
	hypes?: number;
	involved_companies?: Array<InvolvedCompany> | number[];
	keywords?: Array<Keyword> | number[];
	multiplayer_modes?: Array<MultiplayerMode> | number[];
	name?: string;
	parent_game?: Game | number;
	platforms?: Array<Platform> | number[];
	player_perspectives?: Array<PlayerPerspective> | number[];
	popularity?: number;
	pulse_count?: number;
	rating?: number;
	rating_count?: number;
	release_dates?: Array<ReleaseDate> | number[];
	screenshots?: Array<Screenshot> | number[];
	similar_games?: Array<Game> | number[];
	slug?: string;
	standalone_expansions?: Array<Game> | number[];
	status?: GameStatusEnum;
	storyline?: string;
	summary?: string;
	tags?: Array<number>;
	themes?: Array<Theme> | number[];
	time_to_beat?: TimeToBeat | number;
	total_rating?: number;
	total_rating_count?: number;
	updated_at?: number;
	url?: string;
	version_parent?: Game | number;
	version_title?: string;
	videos?: Array<GameVideo> | number[];
	websites?: Array<Website> | number[];
}

interface GameEngine extends ApiObject {
	id: number;
	companies?: Array<Company> | number[];
	created_at?: number;
	description?: string;
	logo?: GameEngineLogo | number;
	name?: string;
	platforms?: Array<Platform> | number[];
	slug?: string;
	updated_at?: number;
	url?: string;
}

interface GameEngineLogo extends ApiObject {
	id: number;
	alpha_channel?: boolean;
	animated?: boolean;
	height?: number;
	image_id?: string;
	url?: string;
	width?: number;
}

interface GameMode extends ApiObject {
	id: number;
	created_at?: number;
	name?: string;
	slug?: string;
	updated_at?: number;
	url?: string;
}

interface GameVersionFeature extends ApiObject {
	id: number;
	category?: GameVersionFeatureCategoryEnum;
	description?: string;
	position?: number;
	title?: string;
	values?: Array<GameVersionFeatureValue> | number[];
}

interface GameVersionFeatureValue extends ApiObject {
	id: number;
	game?: Game | number;
	game_feature?: GameVersionFeature | number;
	included_feature?: GameVersionFeatureValueIncludedFeatureEnum;
	note?: string;
}

interface GameVideo extends ApiObject {
	id: number;
	game?: Game | number;
	name?: string;
	video_id?: string;
}

interface Genre extends ApiObject {
	id: number;
	created_at?: number;
	name?: string;
	slug?: string;
	updated_at?: number;
	url?: string;
}

interface InvolvedCompany extends ApiObject {
	id: number;
	company?: Company | number;
	created_at?: number;
	developer?: boolean;
	game?: Game | number;
	porting?: boolean;
	publisher?: boolean;
	supporting?: boolean;
	updated_at?: number;
}

interface Keyword extends ApiObject {
	id: number;
	created_at?: number;
	name?: string;
	slug?: string;
	updated_at?: number;
	url?: string;
}

interface List extends ApiObject {
	id: number;
	created_at?: number;
	description?: string;
	entries_count?: number;
	list_entries?: Array<ListEntry> | number[];
	list_tags?: Array<number>;
	listed_games?: Array<Game> | number[];
	name?: string;
	numbering?: boolean;
	private?: boolean;
	similar_lists?: Array<List> | number[];
	slug?: string;
	updated_at?: number;
	url?: string;
	user?: User | number;
}

interface ListEntry extends ApiObject {
	id: number;
	description?: string;
	game?: Game | number;
	list?: List | number;
	platform?: Platform | number;
	position?: number;
	private?: boolean;
	user?: User | number;
}

interface MultiplayerMode extends ApiObject {
	id: number;
	campaigncoop?: boolean;
	dropin?: boolean;
	game?: Game | number;
	lancoop?: boolean;
	offlinecoop?: boolean;
	offlinecoopmax?: number;
	offlinemax?: number;
	onlinecoop?: boolean;
	onlinecoopmax?: number;
	onlinemax?: number;
	platform?: Platform | number;
	splitscreen?: boolean;
	splitscreenonline?: boolean;
}

interface Page extends ApiObject {
	id: number;
	background?: PageBackground | number;
	battlenet?: string;
	category?: PageCategoryEnum;
	color?: ColorColorEnum;
	company?: Company | number;
	country?: number;
	created_at?: number;
	description?: string;
	feed?: Feed | number;
	game?: Game | number;
	name?: string;
	origin?: string;
	page_follows_count?: number;
	page_logo?: PageLogo | number;
	slug?: string;
	sub_category?: PageSubCategoryEnum;
	updated_at?: number;
	uplay?: string;
	url?: string;
	user?: User | number;
	websites?: Array<PageWebsite> | number[];
}

interface PageBackground extends ApiObject {
	id: number;
	alpha_channel?: boolean;
	animated?: boolean;
	height?: number;
	image_id?: string;
	url?: string;
	width?: number;
}

interface PageLogo extends ApiObject {
	id: number;
	alpha_channel?: boolean;
	animated?: boolean;
	height?: number;
	image_id?: string;
	url?: string;
	width?: number;
}

interface PageWebsite extends ApiObject {
	id: number;
	category?: WebsiteCategoryEnum;
	trusted?: boolean;
	url?: string;
}

interface Person extends ApiObject {
	id: number;
	bio?: string;
	characters?: Array<Character> | number[];
	country?: number;
	created_at?: number;
	credited_games?: Array<Game> | number[];
	description?: string;
	dob?: number;
	gender?: GenderGenderEnum;
	loves_count?: number;
	mug_shot?: PersonMugShot | number;
	name?: string;
	nicknames?: Array<string> | number[];
	parent?: Person | number;
	slug?: string;
	updated_at?: number;
	url?: string;
	voice_acted?: Array<Game> | number[];
	websites?: Array<PersonWebsite> | number[];
}

interface PersonMugShot extends ApiObject {
	id: number;
	height?: number;
	image_id?: string;
	url?: string;
	width?: number;
}

interface PersonWebsite extends ApiObject {
	id: number;
	category?: WebsiteCategoryEnum;
	trusted?: boolean;
	url?: string;
}

interface Platform extends ApiObject {
	id: number;
	abbreviation?: string;
	alternative_name?: string;
	category?: PlatformCategoryEnum;
	created_at?: number;
	generation?: number;
	name?: string;
	platform_logo?: PlatformLogo | number;
	product_family?: ProductFamily | number;
	slug?: string;
	summary?: string;
	updated_at?: number;
	url?: string;
	versions?: Array<PlatformVersion> | number[];
	websites?: Array<PlatformWebsite> | number[];
}

interface PlatformLogo extends ApiObject {
	id: number;
	alpha_channel?: boolean;
	animated?: boolean;
	height?: number;
	image_id?: string;
	url?: string;
	width?: number;
}

interface PlatformVersion extends ApiObject {
	id: number;
	companies?: Array<PlatformVersionCompany> | number[];
	connectivity?: string;
	cpu?: string;
	graphics?: string;
	main_manufacturer?: PlatformVersionCompany | number;
	media?: string;
	memory?: string;
	name?: string;
	online?: string;
	os?: string;
	output?: string;
	platform_logo?: PlatformLogo | number;
	platform_version_release_dates?: Array<PlatformVersionReleaseDate> | number[];
	resolutions?: string;
	slug?: string;
	sound?: string;
	storage?: string;
	summary?: string;
	url?: string;
}

interface PlatformVersionCompany extends ApiObject {
	id: number;
	comment?: string;
	company?: Company | number;
	developer?: boolean;
	manufacturer?: boolean;
}

interface PlatformVersionReleaseDate extends ApiObject {
	id: number;
	category?: DateFormatStartDateCategoryEnum;
	created_at?: number;
	date?: number;
	human?: string;
	m?: number;
	platform_version?: PlatformVersion | number;
	region?: RegionLanguageEnum;
	updated_at?: number;
	y?: number;
}

interface PlatformWebsite extends ApiObject {
	id: number;
	category?: WebsiteCategoryEnum;
	trusted?: boolean;
	url?: string;
}

interface PlayerPerspective extends ApiObject {
	id: number;
	created_at?: number;
	name?: string;
	slug?: string;
	updated_at?: number;
	url?: string;
}

interface ProductFamily extends ApiObject {
	id: number;
	name?: string;
	slug?: string;
}

interface Pulse extends ApiObject {
	id: number;
	author?: string;
	category?: number;
	created_at?: number;
	ignored?: boolean;
	image?: string;
	published_at?: number;
	pulse_image?: PulseImage | number;
	pulse_source?: PulseSource | number;
	summary?: string;
	tags?: Array<number>;
	title?: string;
	uid?: string;
	updated_at?: number;
	videos?: Array<string> | number[];
	website?: PulseUrl | number;
}

interface PulseImage extends ApiObject {
	id: number;
	alpha_channel?: boolean;
	animated?: boolean;
	height?: number;
	image_id?: string;
	url?: string;
	width?: number;
}

interface PulseSource extends ApiObject {
	id: number;
	game?: Game | number;
	name?: string;
	page?: Page | number;
}

interface PulseUrl extends ApiObject {
	id: number;
	trusted?: boolean;
	url?: string;
}

interface ReleaseDate extends ApiObject {
	id: number;
	category?: DateFormatStartDateCategoryEnum;
	created_at?: number;
	date?: number;
	game?: Game | number;
	human?: string;
	m?: number;
	platform?: Platform | number;
	region?: RegionLanguageEnum;
	updated_at?: number;
	y?: number;
}

interface Screenshot extends ApiObject {
	id: number;
	alpha_channel?: boolean;
	animated?: boolean;
	game?: Game | number;
	height?: number;
	image_id?: string;
	url?: string;
	width?: number;
}

interface SocialMetric extends ApiObject {
	id: number;
	category?: SocialMetricCategoryEnum;
	created_at?: number;
	social_metric_source?: SocialMetricSource | number;
	value?: number;
}

interface SocialMetricSource extends ApiObject {
	id: number;
	category?: number;
	channel?: string;
	channel_title?: string;
	created_at?: number;
	duration?: number;
	external_id?: string;
	game?: Game | number;
	internal_name?: string;
	meta?: string;
	metric_tags?: Array<string> | number[];
	published_at?: number;
	social_metrics?: Array<SocialMetric> | number[];
	social_network?: SocialMetricSourceSocialNetworkEnum;
	title?: string;
	updated_at?: number;
	url?: string;
}

interface Theme extends ApiObject {
	id: number;
	created_at?: number;
	name?: string;
	slug?: string;
	updated_at?: number;
	url?: string;
}

interface TimeToBeat extends ApiObject {
	id: number;
	completely?: number;
	game?: Game | number;
	hastly?: number;
	normally?: number;
}

interface User extends ApiObject {
	id: number;
	battlenet?: string;
	color?: ColorColorEnum;
	created_at?: number;
	discord?: string;
	facebook?: string;
	google_plus?: string;
	instagram?: string;
	linkedin?: string;
	origin?: string;
	pinterest?: string;
	presentation?: string;
	reddit?: string;
	role?: UserRoleEnum;
	slug?: string;
	soundcloud?: string;
	steam?: string;
	twitch?: string;
	twitter?: string;
	updated_at?: number;
	uplay?: string;
	url?: string;
	username?: string;
	youtube?: string;
}

interface Website extends ApiObject {
	id: number;
	category?: WebsiteCategoryEnum;
	game?: Game | number;
	trusted?: boolean;
	url?: string;
}

const enum RegionLanguageEnum {
	REGION_LANGUAGE_NULL = 0,
	EUROPE = 1,
	NORTH_AMERICA = 2,
	AUSTRALIA = 3,
	NEW_ZELAND = 4,
	JAPAN = 5,
	CHINA = 6,
	ASIA = 7,
	WORLDWIDE = 8,
	HONG_KONG = 9,
	SOUTH_KOREA = 10
}

export enum AgeRatingRatingEnum {
	AGERATING_RATING_NULL = 0,
	THREE = 1,
	SEVEN = 2,
	TWELVE = 3,
	SIXTEEN = 4,
	EIGHTEEN = 5,
	RP = 6,
	EC = 7,
	E = 8,
	E10 = 9,
	T = 10,
	M = 11,
	AO = 12
}

const enum AgeRatingCategoryEnum {
	AGERATING_CATEGORY_NULL = 0,
	ESRB = 1,
	PEGI = 2
}

const enum GenderGenderEnum {
	GENDER_GENDER_NULL = 0,
	MALE = 1,
	FEMALE = 2,
	OTHER = 3
}

const enum CharacterSpeciesEnum {
	CHARACTER_SPECIES_NULL = 0,
	HUMAN = 1,
	ALIEN = 2,
	ANIMAL = 3,
	ANDROID = 4,
	UNKNOWN = 5
}

const enum DateFormatStartDateCategoryEnum {
	YYYYMMMMDD = 0,
	YYYYMMMM = 1,
	YYYY = 2,
	YYYYQ1 = 3,
	YYYYQ2 = 4,
	YYYYQ3 = 5,
	YYYYQ4 = 6,
	TBD = 7
}

const enum WebsiteCategoryEnum {
	WEBSITE_CATEGORY_NULL = 0,
	WEBSITE_OFFICIAL = 1,
	WEBSITE_WIKIA = 2,
	WEBSITE_WIKIPEDIA = 3,
	WEBSITE_FACEBOOK = 4,
	WEBSITE_TWITTER = 5,
	WEBSITE_TWITCH = 6,
	WEBSITE_INSTAGRAM = 8,
	WEBSITE_YOUTUBE = 9,
	WEBSITE_IPHONE = 10,
	WEBSITE_IPAD = 11,
	WEBSITE_ANDROID = 12,
	WEBSITE_STEAM = 13,
	WEBSITE_REDDIT = 14,
	WEBSITE_ITCH = 15,
	WEBSITE_EPICGAMES = 16,
	WEBSITE_GOG = 17
}

const enum ExternalGameCategoryEnum {
	EXTERNALGAME_CATEGORY_NULL = 0,
	EXTERNALGAME_STEAM = 1,
	EXTERNALGAME_GOG = 5,
	EXTERNALGAME_YOUTUBE = 10,
	EXTERNALGAME_MICROSOFT = 11,
	EXTERNALGAME_APPLE = 13,
	EXTERNALGAME_TWITCH = 14,
	EXTERNALGAME_ANDROID = 15
}

const enum FeedCategoryEnum {
	FEED_CATEGORY_NULL = 0,
	PULSE_ARTICLE = 1,
	COMING_SOON = 2,
	NEW_TRAILER = 3,
	USER_CONTRIBUTED_ITEM = 5,
	USER_CONTRIBUTIONS_ITEM = 6,
	PAGE_CONTRIBUTED_ITEM = 7
}

const enum GameCategoryEnum {
	MAIN_GAME = 0,
	DLC_ADDON = 1,
	EXPANSION = 2,
	BUNDLE = 3,
	STANDALONE_EXPANSION = 4
}

const enum GameStatusEnum {
	RELEASED = 0,
	ALPHA = 2,
	BETA = 3,
	EARLY_ACCESS = 4,
	OFFLINE = 5,
	CANCELLED = 6
}

const enum GameVersionFeatureCategoryEnum {
	BOOLEAN = 0,
	DESCRIPTION = 1
}

const enum GameVersionFeatureValueIncludedFeatureEnum {
	NOT_INCLUDED = 0,
	INCLUDED = 1,
	PRE_ORDER_ONLY = 2
}

const enum PageCategoryEnum {
	PAGE_CATEGORY_NULL = 0,
	PERSONALITY = 1,
	MEDIA_ORGANIZATION = 2,
	CONTENT_CREATOR = 3,
	CLAN_TEAM = 4
}

const enum ColorColorEnum {
	GREEN = 0,
	BLUE = 1,
	RED = 2,
	ORANGE = 3,
	PINK = 4,
	YELLOW = 5
}

const enum PageSubCategoryEnum {
	PAGE_SUB_CATEGORY_NULL = 0,
	USER = 1,
	GAME = 2,
	COMPANY = 3,
	CONSUMER = 4,
	INDUSTRY = 5,
	E_SPORTS = 6
}

const enum PlatformCategoryEnum {
	PLATFORM_CATEGORY_NULL = 0,
	CONSOLE = 1,
	ARCADE = 2,
	PLATFORM = 3,
	OPERATING_SYSTEM = 4,
	PORTABLE_CONSOLE = 5,
	COMPUTER = 6
}

const enum SocialMetricCategoryEnum {
	SOCIALMETRIC_CATEGORY_NULL = 0,
	FOLLOWS = 1,
	LIKES = 2,
	HATES = 3,
	SHARES = 4,
	VIEW = 5,
	COMMENTS = 6,
	FAVORITES = 7
}

const enum SocialMetricSourceSocialNetworkEnum {
	SOCIALMETRICSOURCE_SOCIAL_NETWORK_NULL = 0,
	SOCIALMETRICSOURCE_OFFICIAL = 1,
	SOCIALMETRICSOURCE_WIKIA = 2,
	SOCIALMETRICSOURCE_WIKIPEDIA = 3,
	SOCIALMETRICSOURCE_FACEBOOK = 4,
	SOCIALMETRICSOURCE_TWITTER = 5,
	SOCIALMETRICSOURCE_TWITCH = 6,
	SOCIALMETRICSOURCE_INSTAGRAM = 8,
	SOCIALMETRICSOURCE_YOUTUBE = 9,
	SOCIALMETRICSOURCE_IPHONE = 10,
	SOCIALMETRICSOURCE_IPAD = 11,
	SOCIALMETRICSOURCE_ANDROID = 12,
	SOCIALMETRICSOURCE_STEAM = 13,
	SOCIALMETRICSOURCE_REDDIT = 14
}

const enum UserRoleEnum {
	USER_ROLE_NULL = 0,
	USER_USER = 1,
	USER_ADVANCED_USER = 2,
	USER_SUPER_ADVANCED_USER = 3,
	USER_KEEPER = 4,
	USER_ADMIN = 9,
	USER_SUPER_ADMIN = 10
}
