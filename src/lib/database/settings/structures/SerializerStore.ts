import { AliasStore } from '@sapphire/framework';
import { Serializer } from './Serializer';

export class SerializerStore extends AliasStore<Serializer<unknown>> {
	/**
	 * Constructs our SerializerStore for use in Skyra.
	 * @param client The client that instantiates this store
	 */
	public constructor() {
		super(Serializer as any, { name: 'serializers' });
		this.container.client.stores.register(this);
	}
}
