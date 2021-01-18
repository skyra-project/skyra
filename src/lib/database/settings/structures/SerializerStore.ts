import { AliasStore } from 'klasa';
import { Serializer } from './Serializer';

export class SerializerStore extends AliasStore<Serializer<unknown>> {
	/**
	 * Constructs our SerializerStore for use in Klasa.
	 * @param client The client that instantiates this store
	 */
	public constructor() {
		super(Serializer as any, { name: 'serializers' });
		this.context.client.registerStore(this);
	}
}
