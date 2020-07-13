export namespace AnalyticsSchema {

	export const enum Tags {
		Shard = 'shard',
		Guild = 'guild_id',
		Client = 'client_id',
		Action = 'action',
		OriginEvent = 'origin_event'
	}

	export const enum Actions {
		Addition = 'addition',
		Subtraction = 'subtraction',
		Sync = 'sync'
	}

}
