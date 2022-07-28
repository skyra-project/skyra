export interface IdentifiablePayload {
	id: number;
}

export type NoId<T> = Omit<T, 'id'>;

export const enum IncomingType {
	RunRegExp
}

export type IncomingPayload = IncomingRunRegExpPayload;

export interface IncomingRunRegExpPayload extends IdentifiablePayload {
	type: IncomingType.RunRegExp;
	regExp: RegExp;
	content: string;
}

export const enum OutgoingType {
	Heartbeat,
	UnknownCommand,
	NoContent,
	RegExpMatch
}

export type OutgoingPayload = OutgoingHeartbeatPayload | OutgoingUnknownCommandPayload | OutgoingNoContentPayload | OutgoingRegExpMatchPayload;

export interface OutgoingHeartbeatPayload {
	type: OutgoingType.Heartbeat;
}

export interface OutgoingUnknownCommandPayload extends IdentifiablePayload {
	type: OutgoingType.UnknownCommand;
}

export interface OutgoingNoContentPayload extends IdentifiablePayload {
	type: OutgoingType.NoContent;
}

export interface OutgoingRegExpMatchPayload extends IdentifiablePayload {
	type: OutgoingType.RegExpMatch;
	filtered: string;
	highlighted: string;
}
