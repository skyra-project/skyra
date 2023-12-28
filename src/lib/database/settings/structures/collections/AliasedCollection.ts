import { Collection } from 'discord.js';

export class AliasedCollection<K, V> extends Collection<K, V> {
	/**
	 * The aliases for this collection:
	 */
	public readonly aliases = new Collection<K, V>();

	public override get(key: K): V | undefined {
		return super.get(key) ?? this.aliases.get(key);
	}
}
