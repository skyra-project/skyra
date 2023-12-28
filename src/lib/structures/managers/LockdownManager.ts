import type { AccurateTimeout } from '#utils/Timers';
import type { GuildTextBasedChannelTypes } from '@sapphire/discord.js-utilities';
import { Collection, type Role } from 'discord.js';

export class LockdownManager extends Collection<string, Collection<string, LockdownManager.Entry>> {
	public add(role: Role, channel: LockdownManager.Channel, value: LockdownManager.Entry) {
		const roles = this.acquire(channel);
		roles.get(role.id)?.timeout?.stop();
		roles.set(role.id, value);
	}

	public remove(role: Role): this;
	public remove(role: Role, channel: LockdownManager.Channel): boolean;
	public remove(role: Role, channel?: LockdownManager.Channel) {
		if (channel === undefined) return this.removeRole(role);

		const channels = this.get(channel.id);
		if (channels === undefined) return false;

		const entry = channels.get(role.id);
		if (entry === undefined) return false;

		entry.timeout?.stop();
		channels.delete(role.id);

		if (channels.size === 0) {
			super.delete(channel.id);
		}

		return true;
	}

	public override delete(id: string) {
		const roles = this.get(id);
		if (roles === undefined) return false;

		for (const role of roles.values()) {
			role.timeout?.stop();
		}

		return super.delete(id);
	}

	public acquire(channel: LockdownManager.Channel) {
		let collection = this.get(channel.id);
		if (collection === undefined) {
			collection = new Collection();
			this.set(channel.id, collection);
		}

		return collection;
	}

	private removeRole(role: Role) {
		for (const channel of this.values()) {
			const entry = channel.get(role.id);
			if (entry === undefined) continue;

			entry.timeout?.stop();
			channel.delete(role.id);
		}

		return this;
	}
}

export namespace LockdownManager {
	export type Channel = GuildTextBasedChannelTypes;
	export interface Entry {
		allowed: boolean | null;
		timeout: AccurateTimeout | null;
	}
}
