export interface IdentifiablePayload {
	id: number;
}

export type NoId<T> = Omit<T, 'id'>;

export const enum IncomingType {
	UpdateGuildRegExp,
	RunGuildRegExp
}

export type IncomingPayload = IncomingUpdateGuildRegExpPayload | IncomingRunGuildRegExpPayload;

export interface IncomingUpdateGuildRegExpPayload extends IdentifiablePayload {
	type: IncomingType.UpdateGuildRegExp;
	guildID: string;
	data: RegExp | null;
}

export interface IncomingRunGuildRegExpPayload extends IdentifiablePayload {
	type: IncomingType.RunGuildRegExp;
	guildID: string;
	content: string;
}

export const enum OutgoingType {
	Heartbeat,
	NoContent,
	RegExpMatch
}

export type OutgoingPayload = OutgoingHeartbeatPayload | OutgoingNoContentPayload | OutgoingRegExpMatchPayload;

export interface OutgoingHeartbeatPayload {
	type: OutgoingType.Heartbeat;
}

export interface OutgoingNoContentPayload extends IdentifiablePayload {
	type: OutgoingType.NoContent;
}

export interface OutgoingRegExpMatchPayload extends IdentifiablePayload {
	type: OutgoingType.RegExpMatch;
	filtered: string;
	highlighted: string;
}
