export const enum DiscordEvents {
	ChannelCreate = 'CHANNEL_CREATE',
	ChannelDelete = 'CHANNEL_DELETE',
	ChannelPinsUpdate = 'CHANNEL_PINS_UPDATE',
	ChannelUpdate = 'CHANNEL_UPDATE',
	Debug = 'DEBUG',
	Error = 'ERROR',
	EventError = 'EVENT_ERROR',
	GuildAvailable = 'GUILD_AVAILABLE',
	GuildBanAdd = 'GUILD_BAN_ADD',
	GuildBanRemove = 'GUILD_BAN_REMOVE',
	GuildCreate = 'GUILD_CREATE',
	GuildDelete = 'GUILD_DELETE',
	GuildEmojiCreate = 'GUILD_EMOJI_CREATE',
	GuildEmojiDelete = 'GUILD_EMOJI_DELETE',
	GuildEmojisUpdate = 'GUILD_EMOJIS_UPDATE',
	GuildEmojiUpdate = 'GUILD_EMOJI_UPDATE',
	GuildIntegrationsUpdate = 'GUILD_INTEGRATIONS_UPDATE',
	GuildMemberAdd = 'GUILD_MEMBER_ADD',
	GuildMemberRemove = 'GUILD_MEMBER_REMOVE',
	GuildMembersChunk = 'GUILD_MEMBERS_CHUNK',
	GuildMemberUpdate = 'GUILD_MEMBER_UPDATE',
	GuildRoleCreate = 'GUILD_ROLE_CREATE',
	GuildRoleDelete = 'GUILD_ROLE_DELETE',
	GuildRoleUpdate = 'GUILD_ROLE_UPDATE',
	GuildUnavailable = 'GUILD_UNAVAILABLE',
	GuildUpdate = 'GUILD_UPDATE',
	InviteCreate = 'INVITE_CREATE',
	InviteDelete = 'INVITE_DELETE',
	MessageCreate = 'MESSAGE_CREATE',
	MessageDelete = 'MESSAGE_DELETE',
	MessageDeleteBulk = 'MESSAGE_DELETE_BULK',
	MessageReactionAdd = 'MESSAGE_REACTION_ADD',
	MessageReactionRemove = 'MESSAGE_REACTION_REMOVE',
	MessageReactionRemoveAll = 'MESSAGE_REACTION_REMOVE_ALL',
	MessageReactionRemoveEmoji = 'MESSAGE_REACTION_REMOVE_EMOJI',
	MessageUpdate = 'MESSAGE_UPDATE',
	PresenceUpdate = 'PRESENCE_UPDATE',
	PieceDisabled = 'PIECE_DISABLED',
	PieceEnabled = 'PIECE_ENABLED',
	PieceLoaded = 'PIECE_LOADED',
	PieceReloaded = 'PIECE_RELOADED',
	PieceUnloaded = 'PIECE_UNLOADED',
	Ready = 'READY',
	RESTDebug = 'REST_DEBUG',
	Resumed = 'RESUMED',
	Ratelimited = 'RATELIMITED',
	ShardOnline = 'SHARD_ONLINE',
	ShardReady = 'SHARD_READY',
	ShardResumed = 'SHARD_RESUMED',
	TypingStart = 'TYPING_START',
	UserUpdate = 'USER_UPDATE',
	VoiceServerUpdate = 'VOICE_SERVER_UPDATE',
	VoiceStateUpdate = 'VOICE_STATE_UPDATE',
	WebhooksUpdate = 'WEBHOOKS_UPDATE',
	WSDebug = 'WS_DEBUG',
	WTF = 'WTF'
}

export const enum LavalinkEvents {
	Close = 'close',
	Raw = 'raw',
	Ready = 'ready'
}

export const enum LavalinkPlayerEvents {
	PlayerUpdate = 'playerUpdate',
	Start = 'start',
	Error = 'error',
	End = 'end'
}

export const enum DiscordVoiceCloseEventCodes {
	/** You sent an invalid {@link https://discord.com/developers/ opcode}. */
	UnknownOpcode = 4001,
	/** You sent a payload before {@link https://discord.com/developers/docs/topics/gateway#gateway-identify identifying} with the Gateway. */
	NotAuthenticated = 4003,
	/** The token you sent in your {@link https://discord.com/developers/docs/topics/gateway#gateway-identify identify} payload is incorrect. */
	AuthenticationFailed = 4004,
	/** You sent more than one {@link https://discord.com/developers/docs/topics/gateway#gateway-identify identify} payload. Stahp. */
	AlreadyAuthenticated = 4005,
	/** Your session is no longer valid. */
	SessionNoLongerValid = 4006,
	/** Your session has timed out. */
	SessionTimeout = 4009,
	/** We can't find the server you're trying to connect to. */
	ServerNotFound = 4011,
	/** We didn't recognize the {@link https://discord.com/developers/ protocol} you sent. */
	UnknownProtocol = 4012,
	/** Either the channel was deleted or you were kicked. Should not reconnect. */
	Disconnected = 4014,
	/** The server crashed. Our bad! Try {@link https://discord.com/developers/ resuming}. */
	VoiceServerCrashed = 4015,
	/** We didn't recognize your {@link https://discord.com/developers/ encryption}. */
	UnknownEncryptionMode = 4016
}
