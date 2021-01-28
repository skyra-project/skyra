import type { LoginData } from '@sapphire/plugin-api';
import type { FlattenedGuild, FlattenedUser } from './ApiTransformers';

export interface PartialOauthFlattenedGuild extends Omit<FlattenedGuild, 'joinedTimestamp' | 'ownerID' | 'region' | 'features'> {
	joinedTimestamp: FlattenedGuild['joinedTimestamp'] | null;
	ownerID: FlattenedGuild['ownerID'] | null;
	region: FlattenedGuild['region'] | null;
}

export interface OauthFlattenedGuild extends PartialOauthFlattenedGuild {
	permissions: string;
	manageable: boolean;
	skyraIsIn: boolean;
}

export interface OauthFlattenedUser {
	user: FlattenedUser;
	guilds: OauthFlattenedGuild[];
}

export interface TransformedLoginData extends LoginData {
	transformedGuilds?: OauthFlattenedGuild[];
}
