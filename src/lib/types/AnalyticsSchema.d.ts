export namespace AnalyticsSchema {
	export const enum Points {
		Guilds = 'guilds',
		Users = 'users',
		Commands = 'commands',
		VoiceConnections = 'voice_connections',
		Economy = 'economy',
		TwitchSubscriptions = 'twitch_subscriptions',
		TwitchSubscriptionHook = 'twitch_subscription_hook',
		PerCoreCPULoad = 'per_core_cpu_load',
		Memory = 'memory',
		MessageCount = 'message_count'
	}

	export const enum Tags {
		Shard = 'shard',
		Guild = 'guild_id',
		User = 'user_id',
		Client = 'client_id',
		Action = 'action',
		OriginEvent = 'origin_event',
		MigrationName = 'migration_name',
		ValueType = 'value_type',
		TwitchStreamStatus = 'twitch_stream_status'
	}

	export const enum CommandCategoryTypes {
		Category = 'category',
		SubCategory = 'sub_category'
	}

	export const enum EconomyValueType {
		Size = 'size'
	}

	export const enum EconomyType {
		Money = 'total_money',
		Vault = 'total_vault'
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
}
