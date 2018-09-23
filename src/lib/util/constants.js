/* eslint "key-spacing": ["error", { "beforeColon": true, "align": "colon" }] */
/* eslint "no-bitwise": "off", "no-multi-spaces": "off" */

const BAN        = 0b0000;
const KICK       = 0b0001;
const MUTE       = 0b0010;
const PRUNE      = 0b0011;
const SOFT_BAN   = 0b0100;
const VOICE_KICK = 0b0101;
const VOICE_MUTE = 0b0110;
const WARN       = 0b0111;

const ACTION_APPEALED = 1 << 4,
	ACTION_TEMPORARY  = 1 << 5;

const TYPE_KEYS = Object.freeze({
	BAN                  : BAN,
	KICK                 : KICK,
	MUTE                 : MUTE,
	PRUNE                : PRUNE,
	SOFT_BAN             : SOFT_BAN,
	VOICE_KICK           : VOICE_KICK,
	VOICE_MUTE           : VOICE_MUTE,
	WARN                 : WARN,
	UN_BAN               : BAN        | ACTION_APPEALED,
	UN_MUTE              : MUTE       | ACTION_APPEALED,
	UN_VOICE_MUTE        : VOICE_MUTE | ACTION_APPEALED,
	UN_WARN              : WARN       | ACTION_APPEALED,
	TEMPORARY_BAN        : BAN        | ACTION_TEMPORARY,
	TEMPORARY_MUTE       : MUTE       | ACTION_TEMPORARY,
	TEMPORARY_VOICE_MUTE : VOICE_MUTE | ACTION_TEMPORARY
});

const TYPE_ASSETS = Object.freeze({
	[TYPE_KEYS.BAN]                  : Object.freeze({ color : 0xD50000, title : 'Ban' }),
	[TYPE_KEYS.KICK]                 : Object.freeze({ color : 0xF57F17, title : 'Kick' }),
	[TYPE_KEYS.MUTE]                 : Object.freeze({ color : 0xF9A825, title : 'Mute' }),
	[TYPE_KEYS.PRUNE]                : Object.freeze({ color : 0xB2FF59, title : 'Message Prune' }),
	[TYPE_KEYS.SOFT_BAN]             : Object.freeze({ color : 0xFF1744, title : 'Softban' }),
	[TYPE_KEYS.VOICE_KICK]           : Object.freeze({ color : 0xFFBB2D, title : 'Voice Kick' }),
	[TYPE_KEYS.VOICE_MUTE]           : Object.freeze({ color : 0xFBC02D, title : 'Voice Mute' }),
	[TYPE_KEYS.WARN]                 : Object.freeze({ color : 0xFFD600, title : 'Warn' }),
	[TYPE_KEYS.UN_BAN]               : Object.freeze({ color : 0x304FFE, title : 'Unban' }),
	[TYPE_KEYS.UN_MUTE]              : Object.freeze({ color : 0x448AFF, title : 'Unmute' }),
	[TYPE_KEYS.UN_VOICE_MUTE]        : Object.freeze({ color : 0xBBDEFB, title : 'Voice Unmute' }),
	[TYPE_KEYS.UN_WARN]              : Object.freeze({ color : 0xFFF494, title : 'Unwarn' }),
	[TYPE_KEYS.TEMPORARY_BAN]        : Object.freeze({ color : 0xC51162, title : 'Temporary Ban' }),
	[TYPE_KEYS.TEMPORARY_MUTE]       : Object.freeze({ color : 0xF50057, title : 'Temporary Mute' }),
	[TYPE_KEYS.TEMPORARY_VOICE_MUTE] : Object.freeze({ color : 0xFF4081, title : 'Temporary Voice Mute' })
});

module.exports = {

	TIME : Object.freeze({
		MILLISECOND : 1,
		SECOND      : 1000,
		MINUTE      : 1000 * 60,
		HOUR        : 1000 * 60 * 60,
		DAY         : 1000 * 60 * 60 * 24,
		WEEK        : 1000 * 60 * 60 * 24 * 7,
		YEAR        : 1000 * 60 * 60 * 24 * 365
	}),

	EMOJIS : Object.freeze({ SHINY : '<:ShinyYellow:324157128270938113>' }),

	CONNECT_FOUR : Object.freeze({
		EMOJIS : Object.freeze({
			1        : '<:PlayerONE:352403997300359169>',
			2        : '<:PlayerTWO:352404081974968330>',
			0        : '<:Empty:352403997606412289>',
			WINNER_1 : '<:PlayerONEWin:352403997761601547>',
			WINNER_2 : '<:PlayerTWOWin:352403997958602752>'
		}),
		REACTIONS        : Object.freeze('1⃣ 2⃣ 3⃣ 4⃣ 5⃣ 6⃣ 7⃣'.split(' ')),
		REACTION_OPTIONS : Object.freeze({
			time : 60000,
			max  : 1
		}),
		RESPONSES : Object.freeze({
			FULL_LINE : 0,
			FULL_GAME : 1,
			TIMEOUT   : 2
		})
	}),

	MESSAGE_LOGS : Object.freeze({
		kMessage     : Symbol('kMessage'),
		kNSFWMessage : Symbol('kNSFWMessage'),
		kModeration  : Symbol('kModeration'),
		kMember      : Symbol('kMember')
	}),

	MODERATION : Object.freeze({
		TYPE_KEYS   : TYPE_KEYS,
		TYPE_ASSETS : TYPE_ASSETS,
		SCHEMA_KEYS : Object.freeze({
			CASE       : 'caseID',
			DURATION   : 'duration',
			EXTRA_DATA : 'extraData',
			GUILD      : 'guildID',
			MODERATOR  : 'moderatorID',
			REASON     : 'reason',
			TYPE       : 'type',
			USER       : 'userID',
			CREATED_AT : 'createdAt'
		}),
		ACTIONS : Object.freeze({
			TEMPORARY : ACTION_TEMPORARY,
			APPEALED  : ACTION_APPEALED
		}),
		ERRORS : Object.freeze({
			CASE_APPEALED        : 'CASE_APPEALED',
			CASE_NOT_EXISTS      : 'CASE_NOT_EXISTS',
			CASE_TYPE_NOT_APPEAL : 'CASE_TYPE_NOT_APPEAL'
		})
	})

};
