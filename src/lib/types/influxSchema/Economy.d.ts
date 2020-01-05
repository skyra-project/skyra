export const enum EconomyMeasurements {
	Transaction = 'TRANSACTION',
	Payment = 'PAYMENT',
	Gamble = 'GAMBLE'
}

export const enum EconomyTags {
	Action = 'action',
	Game = 'game',
	Reason = 'reason',
	Target = 'target_id'
}

export const enum EconomyTransactionAction {
	Remove = 'REMOVE',
	Add = 'ADD'
}

export const enum EconomyGambleGame {
	Slotmachine = 'SLOTS',
	CoinFlip = 'CF'
}

export const enum EconomyTransactionReason {
	Gamble = 'GAMBLE',
	TemporaryClaim = 'TEMPORARY_CLAIM',
	Payment = 'PAYMENT',
	Vault = 'VAULT',
	Daily = 'DAILY',
	NotDefined = 'NOT_DEFINED',
	ADMIN = 'ADMIN'
}
