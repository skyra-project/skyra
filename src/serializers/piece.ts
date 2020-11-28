import { Serializer, SerializerStore, SerializerUpdateContext } from '#lib/database';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import type { Awaited } from '@sapphire/utilities';
import type { Piece } from 'klasa';

export default class UserSerializer extends Serializer<string> {
	public constructor(store: SerializerStore, file: string[], directory: string) {
		super(store, file, directory);

		// Adds all pieces, custom or not, to this serialize piece for use in schemas
		this.aliases = [...this.client.pieceStores.keys()].map((type) => type.slice(0, -1));
	}

	public parse(value: string, { entry, language }: SerializerUpdateContext) {
		const store = this.client.pieceStores.get(`${entry.type}s`);
		if (!store) return this.error(language.get(LanguageKeys.Resolvers.InvalidStore, { store: entry.type }));
		const parsed = store.get(value) as Piece | undefined;
		if (parsed && parsed instanceof store.holds) return this.ok(parsed.name);
		return this.error(language.get(LanguageKeys.Resolvers.InvalidPiece, { name: entry.name, piece: entry.type }));
	}

	public isValid(value: string, { entry, language }: SerializerUpdateContext): Awaited<boolean> {
		const store = this.client.pieceStores.get(`${entry.type}s`);
		if (!store) throw language.get(LanguageKeys.Resolvers.InvalidStore, { store: entry.type });
		const parsed = store.get(value);
		if (parsed && parsed instanceof store.holds) return true;
		throw language.get(LanguageKeys.Resolvers.InvalidPiece, { name: entry.name, piece: entry.type });
	}

	public serialize(value: string, { entry }: SerializerUpdateContext) {
		return this.client.pieceStores.get(`${entry.type}s`)?.get(value)?.name ?? 'Unknown Piece';
	}
}
