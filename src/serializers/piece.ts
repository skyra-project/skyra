import { Serializer } from '@lib/database';

export default class UserSerializer extends Serializer {
	public constructor(...args) {
		super(...args);

		// Adds all pieces, custom or not, to this serialize piece for use in schemas
		this.aliases = [...this.client.pieceStores.keys()].map((type) => type.slice(0, -1));
	}

	public async validate(data, { entry, language }) {
		if (entry.type === 'piece') {
			for (const store of this.client.pieceStores.values()) {
				const pce = store.get(data);
				if (pce) return pce;
			}
			throw language.get('resolverInvalidPiece', { name: entry.key, piece: entry.type });
		}
		const store = this.client.pieceStores.get(`${entry.type}s`);
		if (!store) throw language.get('resolverInvalidStore', { store: entry.type });
		const parsed = typeof data === 'string' ? store.get(data) : data;
		if (parsed && parsed instanceof store.holds) return parsed;
		throw language.get('resolverInvalidPiece', { name: entry.key, piece: entry.type });
	}

	public serialize(value) {
		return value.name;
	}
}
