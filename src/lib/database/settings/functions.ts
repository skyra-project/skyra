import { getDefaultGuildSettings } from '#lib/database/settings/constants';
import { deleteSettingsContext, getSettingsContext, updateSettingsContext } from '#lib/database/settings/context/functions';
import type { AdderKey } from '#lib/database/settings/structures/AdderManager';
import type { GuildData, ReadonlyGuildData } from '#lib/database/settings/types';
import { maybeParseNumber } from '#utils/common';
import { AsyncQueue } from '@sapphire/async-queue';
import { container, type Awaitable } from '@sapphire/framework';
import type { PickByValue } from '@sapphire/utilities';
import { Collection, type GuildResolvable, type Snowflake } from 'discord.js';

const cache = new Collection<string, GuildData>();
const queue = new Collection<string, Promise<GuildData>>();
const locks = new Collection<string, AsyncQueue>();
const WeakMapNotInitialized = new WeakSet<ReadonlyGuildData>();

const transformers = {
	selfmodAttachmentsHardActionDuration: maybeParseNumber,
	selfmodCapitalsHardActionDuration: maybeParseNumber,
	selfmodFilterHardActionDuration: maybeParseNumber,
	selfmodInvitesHardActionDuration: maybeParseNumber,
	selfmodLinksHardActionDuration: maybeParseNumber,
	selfmodMessagesHardActionDuration: maybeParseNumber,
	selfmodNewlinesHardActionDuration: maybeParseNumber,
	selfmodReactionsHardActionDuration: maybeParseNumber
} satisfies Record<PickByValue<ReadonlyGuildData, bigint | null>, typeof maybeParseNumber>;

export function serializeSettings(data: ReadonlyGuildData, space?: string | number) {
	return JSON.stringify(data, (key, value) => (key in transformers ? transformers[key as keyof typeof transformers](value) : value), space);
}

export function deleteSettingsCached(guild: GuildResolvable) {
	const id = resolveGuildId(guild);
	locks.delete(id);
	cache.delete(id);
	deleteSettingsContext(id);
}

export function readSettings(guild: GuildResolvable): Awaitable<ReadonlyGuildData> {
	const id = resolveGuildId(guild);

	return cache.get(id) ?? processFetch(id);
}

export function readSettingsAdder(settings: ReadonlyGuildData, key: AdderKey) {
	return getSettingsContext(settings).adders[key];
}

export function readSettingsPermissionNodes(settings: ReadonlyGuildData) {
	return getSettingsContext(settings).permissionNodes;
}

export function readSettingsNoMentionSpam(settings: ReadonlyGuildData) {
	return getSettingsContext(settings).noMentionSpam;
}

export function readSettingsWordFilterRegExp(settings: ReadonlyGuildData) {
	return getSettingsContext(settings).wordFilterRegExp;
}

export function readSettingsCached(guild: GuildResolvable): ReadonlyGuildData | null {
	return cache.get(resolveGuildId(guild)) ?? null;
}

export async function writeSettings(
	guild: GuildResolvable,
	data: Partial<ReadonlyGuildData> | ((settings: ReadonlyGuildData) => Awaitable<Partial<ReadonlyGuildData>>)
) {
	using trx = await writeSettingsTransaction(guild);

	if (typeof data === 'function') {
		data = await data(trx.settings);
	}

	await trx.write(data).submit();
}

export async function writeSettingsTransaction(guild: GuildResolvable) {
	const id = resolveGuildId(guild);
	const queue = locks.ensure(id, () => new AsyncQueue());

	// Acquire a write lock:
	await queue.wait();

	// Fetch the entry:
	const settings = cache.get(id) ?? (await unlockOnThrow(processFetch(id), queue));

	return new Transaction(settings, queue);
}

export class Transaction {
	#changes = Object.create(null) as Partial<ReadonlyGuildData>;
	#hasChanges = false;
	#locking = true;

	public constructor(
		public readonly settings: ReadonlyGuildData,
		private readonly queue: AsyncQueue
	) {}

	public get hasChanges() {
		return this.#hasChanges;
	}

	public get locking() {
		return this.#locking;
	}

	public write(data: Partial<ReadonlyGuildData>) {
		Object.assign(this.#changes, data);
		this.#hasChanges = true;
		return this;
	}

	public async submit() {
		if (!this.#hasChanges) {
			return;
		}

		try {
			if (WeakMapNotInitialized.has(this.settings)) {
				await container.prisma.guild.create({
					// @ts-expect-error readonly
					data: { ...this.settings, ...this.#changes }
				});
				WeakMapNotInitialized.delete(this.settings);
			} else {
				await container.prisma.guild.update({
					where: { id: this.settings.id },
					// @ts-expect-error readonly
					data: this.#changes
				});
			}

			Object.assign(this.settings, this.#changes);
			this.#hasChanges = false;
			updateSettingsContext(this.settings, this.#changes);
		} finally {
			this.#changes = Object.create(null);

			if (this.#locking) {
				this.queue.shift();
				this.#locking = false;
			}
		}
	}

	public abort() {
		if (this.#locking) {
			this.queue.shift();
			this.#locking = false;
		}
	}

	public dispose() {
		if (this.#locking) {
			this.queue.shift();
			this.#locking = false;
		}
	}

	public [Symbol.dispose]() {
		return this.dispose();
	}
}

async function unlockOnThrow(promise: Promise<ReadonlyGuildData>, lock: AsyncQueue) {
	try {
		return await promise;
	} catch (error) {
		lock.shift();
		throw error;
	}
}

async function processFetch(id: string): Promise<ReadonlyGuildData> {
	const previous = queue.get(id);
	if (previous) return previous;

	try {
		const promise = fetch(id);
		queue.set(id, promise);
		const value = await promise;
		getSettingsContext(value);
		return value;
	} finally {
		queue.delete(id);
	}
}

async function fetch(id: string): Promise<GuildData> {
	const { guild } = container.prisma;
	const existing = await guild.findUnique({ where: { id } });
	if (existing) {
		cache.set(id, existing);
		return existing;
	}

	const created = Object.assign(Object.create(null), getDefaultGuildSettings(), { id }) as GuildData;
	cache.set(id, created);
	WeakMapNotInitialized.add(created);
	return created;
}

function resolveGuildId(guild: GuildResolvable): Snowflake {
	const resolvedId = container.client.guilds.resolveId(guild);
	if (resolvedId === null) throw new TypeError(`Cannot resolve "guild" to a Guild instance.`);
	return resolvedId;
}
