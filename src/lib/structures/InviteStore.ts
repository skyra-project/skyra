import { api } from '#lib/discord/Api';
import { minutes, resolveOnErrorCodes } from '#utils/common';
import { Collection, RESTJSONErrorCodes, type RESTGetAPIInviteResult } from 'discord.js';

export class InviteStore extends Collection<string, InviteCodeEntry> {
	private readonly interval = setInterval(() => {
		const deleteAt = Date.now() - minutes(15);
		this.sweep((value) => value.fetchedAt < deleteAt);
	}, minutes(1)).unref();

	public destroy() {
		clearInterval(this.interval);
	}

	public async fetch(code: string) {
		const previous = this.get(code);
		if (typeof previous !== 'undefined') return previous;

		const data = (await resolveOnErrorCodes(api().invites.get(code), RESTJSONErrorCodes.UnknownInvite)) as RESTGetAPIInviteResult | null;
		if (data === null) {
			const resolved: InviteCodeEntry = { valid: false, fetchedAt: Date.now() };
			this.set(code, resolved);
			return resolved;
		}

		const resolved: InviteCodeEntry = {
			valid: true,
			code,
			guildId: Reflect.get(data, 'guild')?.id ?? null,
			fetchedAt: Date.now()
		};
		this.set(code, resolved);
		return resolved;
	}
}

export type InviteCodeEntry = (InviteCodeInvalidEntry | InviteCodeValidEntry) & {
	fetchedAt: number;
};

export interface InviteCodeInvalidEntry {
	valid: false;
}

export interface InviteCodeValidEntry {
	valid: true;
	code: string;
	guildId: string | null;
}
