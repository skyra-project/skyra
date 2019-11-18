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
export interface ApiObject extends Record<string, ApiObjectProperty> {
	id: number;
}

/** Possible types of an ApiObject's properties */
export type ApiObjectProperty =
	| ApiObject[]
	| ApiObject
	| number[]
	| number
	| string
	| string[]
	| boolean
	| undefined;

export interface Count extends ApiObject {
	count?: number;
}

export interface MultiQueryResult extends ApiObject {
	name?: string;
	results?: Array<any> | number[];
	count?: number;
}

export interface MultiQueryResultArray extends ApiObject {
	result?: Array<MultiQueryResult> | number[];
}

export interface AchievementResult extends ApiObject {
	achievements?: Array<Achievement> | number[];
}

export interface Achievement extends ApiObject {
	id: number;
	achievement_icon?: AchievementIcon | number;
	category?: AchievementCategoryEnum;
	created_at?: number;
	description?: string;
	external_id?: string;
	game?: Game | number;
	language?: RegionLanguageEnum;
	locked_achievement_icon?: AchievementIcon | number;
	name?: string;
	owners?: number;
	owners_percentage?: number;
	rank?: AchievementRankEnum;
	slug?: string;
	tags?: Array<number>;
	updated_at?: number;
}

export interface AchievementIconResult extends ApiObject {
	achievementicons?: Array<AchievementIcon> | number[];
}

export interface AchievementIcon extends ApiObject {
	id: number;
	alpha_channel?: boolean;
	animated?: boolean;
	height?: number;
	image_id?: string;
	url?: string;
	width?: number;
}

export interface AgeRatingResult extends ApiObject {
	ageratings?: Array<AgeRating> | number[];
}

export interface AgeRating extends ApiObject {
	id: number;
	category?: AgeRatingCategoryEnum;
	content_descriptions?: Array<AgeRatingContentDescription> | number[];
	rating?: AgeRatingRatingEnum;
	rating_cover_url?: string;
	synopsis?: string;
}

export interface AgeRatingContentDescriptionResult extends ApiObject {
	ageratingcontentdescriptions?: Array<AgeRatingContentDescription> | number[];
}

export interface AgeRatingContentDescription extends ApiObject {
	id: number;
	category?: AgeRatingRatingEnum;
	description?: string;
}

export interface AlternativeNameResult extends ApiObject {
	alternativenames?: Array<AlternativeName> | number[];
}

export interface AlternativeName extends ApiObject {
	id: number;
	comment?: string;
	game?: Game | number;
	name?: string;
}

export interface ApiTokenResult extends ApiObject {
	apitokens?: Array<ApiToken> | number[];
}

export interface ApiToken extends ApiObject {
	id: number;
	created_at?: number;
	expires_in?: number;
	token?: string;
	user?: number;
}

export interface ArtworkResult extends ApiObject {
	artworks?: Array<Artwork> | number[];
}

export interface Artwork extends ApiObject {
	id: number;
	alpha_channel?: boolean;
	animated?: boolean;
	game?: Game | number;
	height?: number;
	image_id?: string;
	url?: string;
	width?: number;
}

export interface CharacterResult extends ApiObject {
	characters?: Array<Character> | number[];
}

export interface Character extends ApiObject {
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

export interface CharacterMugShotResult extends ApiObject {
	charactermugshots?: Array<CharacterMugShot> | number[];
}

export interface CharacterMugShot extends ApiObject {
	id: number;
	alpha_channel?: boolean;
	animated?: boolean;
	height?: number;
	image_id?: string;
	url?: string;
	width?: number;
}

export interface CollectionResult extends ApiObject {
	collections?: Array<Collection> | number[];
}

export interface Collection extends ApiObject {
	id: number;
	created_at?: number;
	games?: Array<Game> | number[];
	name?: string;
	slug?: string;
	updated_at?: number;
	url?: string;
}

export interface CompanyResult extends ApiObject {
	companies?: Array<Company> | number[];
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

export interface CompanyLogoResult extends ApiObject {
	companylogos?: Array<CompanyLogo> | number[];
}

export interface CompanyLogo extends ApiObject {
	id: number;
	alpha_channel?: boolean;
	animated?: boolean;
	height?: number;
	image_id?: string;
	url?: string;
	width?: number;
}

export interface CompanyWebsiteResult extends ApiObject {
	companywebsites?: Array<CompanyWebsite> | number[];
}

export interface CompanyWebsite extends ApiObject {
	id: number;
	category?: WebsiteCategoryEnum;
	trusted?: boolean;
	url?: string;
}

export interface CoverResult extends ApiObject {
	covers?: Array<Cover> | number[];
}

export interface Cover extends ApiObject {
	id: number;
	alpha_channel?: boolean;
	animated?: boolean;
	game?: Game | number;
	height?: number;
	image_id?: string;
	url?: string;
	width?: number;
}

export interface CreditResult extends ApiObject {
	credits?: Array<Credit> | number[];
}

export interface Credit extends ApiObject {
	id: number;
	category?: CreditCategoryEnum;
	character?: Character | number;
	character_credited_name?: string;
	comment?: string;
	company?: Company | number;
	country?: number;
	created_at?: number;
	credited_name?: string;
	game?: Game | number;
	person?: Person | number;
	person_title?: Title | number;
	position?: number;
	updated_at?: number;
}

export interface ExternalGameResult extends ApiObject {
	externalgames?: Array<ExternalGame> | number[];
}

export interface ExternalGame extends ApiObject {
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

export interface FeedResult extends ApiObject {
	feeds?: Array<Feed> | number[];
}

export interface Feed extends ApiObject {
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

export interface FeedFollowResult extends ApiObject {
	feedfollows?: Array<FeedFollow> | number[];
}

export interface FeedFollow extends ApiObject {
	id: number;
	created_at?: number;
	feed?: FeedCategoryEnum;
	published_at?: number;
	updated_at?: number;
	user?: User | number;
}

export interface FollowResult extends ApiObject {
	follows?: Array<Follow> | number[];
}

export interface Follow extends ApiObject {
	id: number;
	game?: Game | number;
	user?: User | number;
}

export interface FranchiseResult extends ApiObject {
	franchises?: Array<Franchise> | number[];
}

export interface Franchise extends ApiObject {
	id: number;
	created_at?: number;
	games?: Array<Game> | number[];
	name?: string;
	slug?: string;
	updated_at?: number;
	url?: string;
}

export interface GameResult extends ApiObject {
	games?: Array<Game> | number[];
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

export interface GameEngineResult extends ApiObject {
	gameengines?: Array<GameEngine> | number[];
}

export interface GameEngine extends ApiObject {
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

export interface GameEngineLogoResult extends ApiObject {
	gameenginelogos?: Array<GameEngineLogo> | number[];
}

export interface GameEngineLogo extends ApiObject {
	id: number;
	alpha_channel?: boolean;
	animated?: boolean;
	height?: number;
	image_id?: string;
	url?: string;
	width?: number;
}

export interface GameModeResult extends ApiObject {
	gamemodes?: Array<GameMode> | number[];
}

export interface GameMode extends ApiObject {
	id: number;
	created_at?: number;
	name?: string;
	slug?: string;
	updated_at?: number;
	url?: string;
}

export interface GameVersionResult extends ApiObject {
	gameversions?: Array<GameVersion> | number[];
}

export interface GameVersion extends ApiObject {
	id: number;
	created_at?: number;
	features?: Array<GameVersionFeature> | number[];
	game?: Game | number;
	games?: Array<Game> | number[];
	updated_at?: number;
	url?: string;
}

export interface GameVersionFeatureResult extends ApiObject {
	gameversionfeatures?: Array<GameVersionFeature> | number[];
}

export interface GameVersionFeature extends ApiObject {
	id: number;
	category?: GameVersionFeatureCategoryEnum;
	description?: string;
	position?: number;
	title?: string;
	values?: Array<GameVersionFeatureValue> | number[];
}

export interface GameVersionFeatureValueResult extends ApiObject {
	gameversionfeaturevalues?: Array<GameVersionFeatureValue> | number[];
}

export interface GameVersionFeatureValue extends ApiObject {
	id: number;
	game?: Game | number;
	game_feature?: GameVersionFeature | number;
	included_feature?: GameVersionFeatureValueIncludedFeatureEnum;
	note?: string;
}

export interface GameVideoResult extends ApiObject {
	gamevideos?: Array<GameVideo> | number[];
}

export interface GameVideo extends ApiObject {
	id: number;
	game?: Game | number;
	name?: string;
	video_id?: string;
}

export interface GenreResult extends ApiObject {
	genres?: Array<Genre> | number[];
}

export interface Genre extends ApiObject {
	id: number;
	created_at?: number;
	name?: string;
	slug?: string;
	updated_at?: number;
	url?: string;
}

export interface InvolvedCompanyResult extends ApiObject {
	involvedcompanies?: Array<InvolvedCompany> | number[];
}

export interface InvolvedCompany extends ApiObject {
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

export interface KeywordResult extends ApiObject {
	keywords?: Array<Keyword> | number[];
}

export interface Keyword extends ApiObject {
	id: number;
	created_at?: number;
	name?: string;
	slug?: string;
	updated_at?: number;
	url?: string;
}

export interface ListResult extends ApiObject {
	lists?: Array<List> | number[];
}

export interface List extends ApiObject {
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

export interface ListEntryResult extends ApiObject {
	listentries?: Array<ListEntry> | number[];
}

export interface ListEntry extends ApiObject {
	id: number;
	description?: string;
	game?: Game | number;
	list?: List | number;
	platform?: Platform | number;
	position?: number;
	private?: boolean;
	user?: User | number;
}

export interface MultiplayerModeResult extends ApiObject {
	multiplayermodes?: Array<MultiplayerMode> | number[];
}

export interface MultiplayerMode extends ApiObject {
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

export interface PageResult extends ApiObject {
	pages?: Array<Page> | number[];
}

export interface Page extends ApiObject {
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

export interface PageBackgroundResult extends ApiObject {
	pagebackgrounds?: Array<PageBackground> | number[];
}

export interface PageBackground extends ApiObject {
	id: number;
	alpha_channel?: boolean;
	animated?: boolean;
	height?: number;
	image_id?: string;
	url?: string;
	width?: number;
}

export interface PageLogoResult extends ApiObject {
	pagelogos?: Array<PageLogo> | number[];
}

export interface PageLogo extends ApiObject {
	id: number;
	alpha_channel?: boolean;
	animated?: boolean;
	height?: number;
	image_id?: string;
	url?: string;
	width?: number;
}

export interface PageWebsiteResult extends ApiObject {
	pagewebsites?: Array<PageWebsite> | number[];
}

export interface PageWebsite extends ApiObject {
	id: number;
	category?: WebsiteCategoryEnum;
	trusted?: boolean;
	url?: string;
}

export interface PersonResult extends ApiObject {
	people?: Array<Person> | number[];
}

export interface Person extends ApiObject {
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

export interface PersonMugShotResult extends ApiObject {
	personmugshots?: Array<PersonMugShot> | number[];
}

export interface PersonMugShot extends ApiObject {
	id: number;
	height?: number;
	image_id?: string;
	url?: string;
	width?: number;
}

export interface PersonWebsiteResult extends ApiObject {
	personwebsites?: Array<PersonWebsite> | number[];
}

export interface PersonWebsite extends ApiObject {
	id: number;
	category?: WebsiteCategoryEnum;
	trusted?: boolean;
	url?: string;
}

export interface PlatformResult extends ApiObject {
	platforms?: Array<Platform> | number[];
}

export interface Platform extends ApiObject {
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

export interface PlatformLogoResult extends ApiObject {
	platformlogos?: Array<PlatformLogo> | number[];
}

export interface PlatformLogo extends ApiObject {
	id: number;
	alpha_channel?: boolean;
	animated?: boolean;
	height?: number;
	image_id?: string;
	url?: string;
	width?: number;
}

export interface PlatformVersionResult extends ApiObject {
	platformversions?: Array<PlatformVersion> | number[];
}

export interface PlatformVersion extends ApiObject {
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

export interface PlatformVersionCompanyResult extends ApiObject {
	platformversioncompanies?: Array<PlatformVersionCompany> | number[];
}

export interface PlatformVersionCompany extends ApiObject {
	id: number;
	comment?: string;
	company?: Company | number;
	developer?: boolean;
	manufacturer?: boolean;
}

export interface PlatformVersionReleaseDateResult extends ApiObject {
	platformversionreleasedates?: Array<PlatformVersionReleaseDate> | number[];
}

export interface PlatformVersionReleaseDate extends ApiObject {
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

export interface PlatformWebsiteResult extends ApiObject {
	platformwebsites?: Array<PlatformWebsite> | number[];
}

export interface PlatformWebsite extends ApiObject {
	id: number;
	category?: WebsiteCategoryEnum;
	trusted?: boolean;
	url?: string;
}

export interface PlayerPerspectiveResult extends ApiObject {
	playerperspectives?: Array<PlayerPerspective> | number[];
}

export interface PlayerPerspective extends ApiObject {
	id: number;
	created_at?: number;
	name?: string;
	slug?: string;
	updated_at?: number;
	url?: string;
}

export interface ProductFamilyResult extends ApiObject {
	productfamilies?: Array<ProductFamily> | number[];
}

export interface ProductFamily extends ApiObject {
	id: number;
	name?: string;
	slug?: string;
}

export interface PulseResult extends ApiObject {
	pulses?: Array<Pulse> | number[];
}

export interface Pulse extends ApiObject {
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

export interface PulseGroupResult extends ApiObject {
	pulsegroups?: Array<PulseGroup> | number[];
}

export interface PulseGroup extends ApiObject {
	id: number;
	created_at?: number;
	game?: Game | number;
	name?: string;
	published_at?: number;
	pulses?: Array<Pulse> | number[];
	tags?: Array<number>;
	updated_at?: number;
}

export interface PulseImageResult extends ApiObject {
	pulseimages?: Array<PulseImage> | number[];
}

export interface PulseImage extends ApiObject {
	id: number;
	alpha_channel?: boolean;
	animated?: boolean;
	height?: number;
	image_id?: string;
	url?: string;
	width?: number;
}

export interface PulseSourceResult extends ApiObject {
	pulsesources?: Array<PulseSource> | number[];
}

export interface PulseSource extends ApiObject {
	id: number;
	game?: Game | number;
	name?: string;
	page?: Page | number;
}

export interface PulseUrlResult extends ApiObject {
	pulseurls?: Array<PulseUrl> | number[];
}

export interface PulseUrl extends ApiObject {
	id: number;
	trusted?: boolean;
	url?: string;
}

export interface RateResult extends ApiObject {
	rates?: Array<Rate> | number[];
}

export interface Rate extends ApiObject {
	id: number;
	game?: Game | number;
	rating?: number;
	user?: User | number;
}

export interface ReleaseDateResult extends ApiObject {
	releasedates?: Array<ReleaseDate> | number[];
}

export interface ReleaseDate extends ApiObject {
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

export interface ReviewResult extends ApiObject {
	reviews?: Array<Review> | number[];
}

export interface Review extends ApiObject {
	id: number;
	category?: ReviewCategoryEnum;
	conclusion?: string;
	content?: string;
	created_at?: number;
	game?: Game | number;
	introduction?: string;
	likes?: number;
	negative_points?: string;
	platform?: Platform | number;
	positive_points?: string;
	slug?: string;
	title?: string;
	updated_at?: number;
	url?: string;
	user?: User | number;
	user_rating?: Rate | number;
	video?: ReviewVideo | number;
	views?: number;
}

export interface ReviewVideoResult extends ApiObject {
	reviewvideos?: Array<ReviewVideo> | number[];
}

export interface ReviewVideo extends ApiObject {
	id: number;
	trusted?: boolean;
	url?: string;
}

export interface ScreenshotResult extends ApiObject {
	screenshots?: Array<Screenshot> | number[];
}

export interface Screenshot extends ApiObject {
	id: number;
	alpha_channel?: boolean;
	animated?: boolean;
	game?: Game | number;
	height?: number;
	image_id?: string;
	url?: string;
	width?: number;
}

export interface SearchResult extends ApiObject {
	searches?: Array<Search> | number[];
}

export interface Search extends ApiObject {
	id: number;
	alternative_name?: string;
	character?: Character | number;
	collection?: Collection | number;
	company?: Company | number;
	description?: string;
	game?: Game | number;
	name?: string;
	person?: Person | number;
	platform?: Platform | number;
	popularity?: number;
	published_at?: number;
	test_dummy?: TestDummy | number;
	theme?: Theme | number;
}

export interface SocialMetricResult extends ApiObject {
	socialmetrics?: Array<SocialMetric> | number[];
}

export interface SocialMetric extends ApiObject {
	id: number;
	category?: SocialMetricCategoryEnum;
	created_at?: number;
	social_metric_source?: SocialMetricSource | number;
	value?: number;
}

export interface SocialMetricSourceResult extends ApiObject {
	socialmetricsources?: Array<SocialMetricSource> | number[];
}

export interface SocialMetricSource extends ApiObject {
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

export interface TestDummyResult extends ApiObject {
	testdummies?: Array<TestDummy> | number[];
}

export interface TestDummy extends ApiObject {
	id: number;
	bool_value?: boolean;
	created_at?: number;
	enum_test?: TestDummyEnumTestEnum;
	float_value?: number;
	game?: Game | number;
	integer_array?: Array<number>;
	integer_value?: number;
	name?: string;
	new_integer_value?: number;
	private?: boolean;
	slug?: string;
	string_array?: Array<string> | number[];
	test_dummies?: Array<TestDummy> | number[];
	test_dummy?: TestDummy | number;
	updated_at?: number;
	url?: string;
	user?: User | number;
}

export interface ThemeResult extends ApiObject {
	themes?: Array<Theme> | number[];
}

export interface Theme extends ApiObject {
	id: number;
	created_at?: number;
	name?: string;
	slug?: string;
	updated_at?: number;
	url?: string;
}

export interface TimeToBeatResult extends ApiObject {
	timetobeats?: Array<TimeToBeat> | number[];
}

export interface TimeToBeat extends ApiObject {
	id: number;
	completely?: number;
	game?: Game | number;
	hastly?: number;
	normally?: number;
}

export interface TitleResult extends ApiObject {
	titles?: Array<Title> | number[];
}

export interface Title extends ApiObject {
	id: number;
	created_at?: number;
	description?: string;
	games?: Array<Game> | number[];
	name?: string;
	slug?: string;
	updated_at?: number;
	url?: string;
}

export interface UserResult extends ApiObject {
	users?: Array<User> | number[];
}

export interface User extends ApiObject {
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

export interface WebsiteResult extends ApiObject {
	websites?: Array<Website> | number[];
}

export interface Website extends ApiObject {
	id: number;
	category?: WebsiteCategoryEnum;
	game?: Game | number;
	trusted?: boolean;
	url?: string;
}


export enum AchievementCategoryEnum {
	ACHIEVEMENT_CATEGORY_NULL = 0,
	PLAYSTATION = 1,
	XBOX = 2,
	STEAM = 3
}

export enum RegionLanguageEnum {
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

export enum AchievementRankEnum {
	ACHIEVEMENT_RANK_NULL = 0,
	BRONZE = 1,
	SILVER = 2,
	GOLD = 3,
	PLATINUM = 4
}

export enum AgeRatingCategoryEnum {
	AGERATING_CATEGORY_NULL = 0,
	ESRB = 1,
	PEGI = 2
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

export enum GenderGenderEnum {
	GENDER_GENDER_NULL = 0,
	MALE = 1,
	FEMALE = 2,
	OTHER = 3
}

export enum CharacterSpeciesEnum {
	CHARACTER_SPECIES_NULL = 0,
	HUMAN = 1,
	ALIEN = 2,
	ANIMAL = 3,
	ANDROID = 4,
	UNKNOWN = 5
}

export enum DateFormatStartDateCategoryEnum {
	YYYYMMMMDD = 0,
	YYYYMMMM = 1,
	YYYY = 2,
	YYYYQ1 = 3,
	YYYYQ2 = 4,
	YYYYQ3 = 5,
	YYYYQ4 = 6,
	TBD = 7
}

export enum WebsiteCategoryEnum {
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
	WEBSITE_DISCORD = 15,
	WEBSITE_GOOGLE_PLUS = 16,
	WEBSITE_TUMBLR = 17,
	WEBSITE_LINKEDIN = 18,
	WEBSITE_PINTEREST = 19,
	WEBSITE_SOUNDCLOUD = 20
}

export enum CreditCategoryEnum {
	CREDIT_CATEGORY_NULL = 0,
	VOICE_ACTOR = 1,
	LANGUAGE = 2,
	COMPANY_CREDIT = 3,
	EMPLOYEE = 4,
	MISC = 5,
	SUPPORT_COMPANY = 6
}

export enum ExternalGameCategoryEnum {
	EXTERNALGAME_CATEGORY_NULL = 0,
	EXTERNALGAME_STEAM = 1,
	EXTERNALGAME_GOG = 5,
	EXTERNALGAME_YOUTUBE = 10,
	EXTERNALGAME_MICROSOFT = 11,
	EXTERNALGAME_APPLE = 13,
	EXTERNALGAME_TWITCH = 14,
	EXTERNALGAME_ANDROID = 15
}

export enum FeedCategoryEnum {
	FEED_CATEGORY_NULL = 0,
	PULSE_ARTICLE = 1,
	COMING_SOON = 2,
	NEW_TRAILER = 3,
	USER_CONTRIBUTED_ITEM = 5,
	USER_CONTRIBUTIONS_ITEM = 6,
	PAGE_CONTRIBUTED_ITEM = 7
}

export enum GameCategoryEnum {
	MAIN_GAME = 0,
	DLC_ADDON = 1,
	EXPANSION = 2,
	BUNDLE = 3,
	STANDALONE_EXPANSION = 4
}

export enum GameStatusEnum {
	RELEASED = 0,
	ALPHA = 2,
	BETA = 3,
	EARLY_ACCESS = 4,
	OFFLINE = 5,
	CANCELLED = 6
}

export enum GameVersionFeatureCategoryEnum {
	BOOLEAN = 0,
	DESCRIPTION = 1
}

export enum GameVersionFeatureValueIncludedFeatureEnum {
	NOT_INCLUDED = 0,
	INCLUDED = 1,
	PRE_ORDER_ONLY = 2
}

export enum PageCategoryEnum {
	PAGE_CATEGORY_NULL = 0,
	PERSONALITY = 1,
	MEDIA_ORGANIZATION = 2,
	CONTENT_CREATOR = 3,
	CLAN_TEAM = 4
}

export enum ColorColorEnum {
	GREEN = 0,
	BLUE = 1,
	RED = 2,
	ORANGE = 3,
	PINK = 4,
	YELLOW = 5
}

export enum PageSubCategoryEnum {
	PAGE_SUB_CATEGORY_NULL = 0,
	USER = 1,
	GAME = 2,
	COMPANY = 3,
	CONSUMER = 4,
	INDUSTRY = 5,
	E_SPORTS = 6
}

export enum PlatformCategoryEnum {
	PLATFORM_CATEGORY_NULL = 0,
	CONSOLE = 1,
	ARCADE = 2,
	PLATFORM = 3,
	OPERATING_SYSTEM = 4,
	PORTABLE_CONSOLE = 5,
	COMPUTER = 6
}

export enum ReviewCategoryEnum {
	REVIEW_CATEGORY_NULL = 0,
	TEXT = 1,
	VIDEO = 2
}

export enum SocialMetricCategoryEnum {
	SOCIALMETRIC_CATEGORY_NULL = 0,
	FOLLOWS = 1,
	LIKES = 2,
	HATES = 3,
	SHARES = 4,
	VIEW = 5,
	COMMENTS = 6,
	FAVORITES = 7
}

export enum SocialMetricSourceSocialNetworkEnum {
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

export enum TestDummyEnumTestEnum {
	TESTDUMMY_ENUM_TEST_NULL = 0,
	ENUM1 = 1,
	ENUM2 = 2
}

export enum UserRoleEnum {
	USER_ROLE_NULL = 0,
	USER_USER = 1,
	USER_ADVANCED_USER = 2,
	USER_SUPER_ADVANCED_USER = 3,
	USER_KEEPER = 4,
	USER_ADMIN = 9,
	USER_SUPER_ADMIN = 10
}
