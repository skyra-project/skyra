import { Serializer, SerializerStore, SerializerUpdateContext } from '@lib/database';
import { Awaited } from '@sapphire/utilities';

export default class UserSerializer extends Serializer<string> {
	public constructor(store: SerializerStore, file: string[], directory: string) {
		super(store, file, directory);

		// Adds all pieces, custom or not, to this serialize piece for use in schemas
		this.aliases = [...this.client.pieceStores.keys()].map((type) => type.slice(0, -1));
	}

	public parse(value: string, { entry, language }: SerializerUpdateContext): Awaited<string> {
		const store = this.client.pieceStores.get(`${entry.type}s`);
		if (!store) throw language.get('resolverInvalidStore', { store: entry.type });
		const parsed = store.get(value);
		if (parsed && parsed instanceof store.holds) return parsed;
		throw language.get('resolverInvalidPiece', { name: entry.name, piece: entry.type });
	}

	public isValid(value: string, { entry, language }: SerializerUpdateContext): Awaited<boolean> {
		const store = this.client.pieceStores.get(`${entry.type}s`);
		if (!store) throw language.get('resolverInvalidStore', { store: entry.type });
		const parsed = store.get(value);
		if (parsed && parsed instanceof store.holds) return true;
		throw language.get('resolverInvalidPiece', { name: entry.name, piece: entry.type });
	}

	public serialize(value: string, { entry }: SerializerUpdateContext) {
		return this.client.pieceStores.get(`${entry.type}s`)?.get(value)?.name ?? 'Unknown Piece';
	}
}
