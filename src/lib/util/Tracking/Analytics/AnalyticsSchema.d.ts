export namespace AnalyticsSchema {

	export const enum Points {
		Guilds = 'guilds',
		Users = 'users',
		Commands = 'commands',
		VoiceConnections = 'voice_connections'
	}

	export const enum Tags {
		Shard = 'shard',
		Guild = 'guild_id',
		User = 'user_id',
		Client = 'client_id',
		Action = 'action',
		OriginEvent = 'origin_event',
		MigrationName = 'migration_name'
	}

	export const enum CommandTags {
		Category = 'category',
		SubCategory = 'sub_category'
	}

	export const enum Actions {
		Addition = 'addition',
		Subtraction = 'subtraction',
		Sync = 'sync',
		Migration = 'migration'
	}

}
