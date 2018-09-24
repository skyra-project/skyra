import { Snowflake } from 'discord.js';
import { SkyraUser } from './klasa';

export type APIResponse = {
	success: boolean;
	response: any;
	type: string;
	code: number;
};

export type ModerationTypes =
	// BAN
	0b0000 |
	// KICK
	0b0001 |
	// MUTE
	0b0010 |
	// PRUNE
	0b0011 |
	// SOFT_BAN
	0b0100 |
	// VOICE_KICK
	0b0101 |
	// VOICE_MUTE
	0b0110 |
	// WARN
	0b0111 |
	// BAN & APPEALED
	0b010000 |
	// MUTE & APPEALED
	0b010010 |
	// VOICE_MUTE & APPEALED
	0b010101 |
	// WARN & APPEALED
	0b010111 |
	// BAN & TEMPORARY
	0b100000 |
	// MUTE & TEMPORARY
	0b100010 |
	// VOICE_MUTE & TEMPORARY
	0b100110;

export type ModerationLogKeys = {
	CASE: 'caseID';
	DURATION: 'duration';
	EXTRA_DATA: 'extraData';
	GUILD: 'guildID';
	MODERATOR: 'moderatorID';
	REASON: 'reason';
	TYPE: 'type';
	USER: 'userID';
	CREATED_AT: 'createdAt';
};

export type ModerationLogData = {
	id?: string;
	caseID: number;
	duration: number | null;
	extraData: any;
	guildID: Snowflake;
	moderatorID: Snowflake | null;
	reason: string | null;
	type: ModerationTypes;
	userID: Snowflake;
	createdAt: number | null;
};

export type ModerationLogEditData = {
	id?: string;
	duration?: number | null;
	extraData?: any;
	moderatorID?: SkyraUser | Snowflake | null;
	reason?: string | null;
};
