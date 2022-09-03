export const enum Points {
	Guilds = 'guilds',
	Users = 'users',
	Commands = 'commands',
	TwitchSubscriptions = 'twitch_subscriptions',
	TwitchSubscriptionHook = 'twitch_subscription_hook',
	PerCoreCPULoad = 'per_core_cpu_load',
	Memory = 'memory',
	MessageCount = 'message_count'
}

export const enum Tags {
	Shard = 'shard',
	Client = 'client_id',
	Action = 'action',
	OriginEvent = 'origin_event',
	MigrationName = 'migration_name',
	TwitchStreamStatus = 'twitch_stream_status'
}

export const enum CommandCategoryTypes {
	Category = 'category'
}

export const enum Actions {
	Addition = 'addition',
	Subtraction = 'subtraction',
	Sync = 'sync',
	Migration = 'migration'
}

export const enum TwitchStreamStatus {
	Online = 'online',
	Offline = 'offline'
}
