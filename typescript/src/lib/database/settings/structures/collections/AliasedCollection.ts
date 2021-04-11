import Collection from '@discordjs/collection';

export class AliasedCollection<K, V> extends Collection<K, V> {
	/**
	 * The aliases for this collection:
	 */
	public readonly aliases = new Collection<K, V>();

	public get(key: K): V | undefined {
		return super.get(key) ?? this.aliases.get(key);
	}
}
