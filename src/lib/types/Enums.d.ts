export const enum PermissionLevels {
	Everyone = 0,
	Moderator = 5,
	Administrator = 6,
	ServerOwner = 7,
	BotOwner = 10
}

export const enum Schedules {
	DelayedGiveawayCreate = 'delayedGiveawayCreate',
	Poststats = 'poststats',
	SyncResourceAnalytics = 'syncResourceAnalytics',
	TwitchRefreshSubscriptions = 'twitchRefreshSubscriptions',
	Reminder = 'reminder'
}
