import { Serializer } from '#lib/database/settings/structures/Serializer';
import { AliasStore } from '@sapphire/framework';

export class SerializerStore extends AliasStore<Serializer<unknown>, 'serializers'> {
	/**
	 * Constructs our SerializerStore for use in Skyra.
	 * @param client The client that instantiates this store
	 */
	public constructor() {
		super(Serializer, { name: 'serializers' });
		this.container.client.stores.register(this);
	}
}
