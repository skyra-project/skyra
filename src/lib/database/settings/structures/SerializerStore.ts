import { Client } from 'discord.js';
import { AliasStore } from 'klasa';
import { Serializer } from './Serializer';

export class SerializerStore extends AliasStore<string, Serializer> {
	/**
	 * Constructs our SerializerStore for use in Klasa.
	 * @param client The client that instantiates this store
	 */
	public constructor(client: Client) {
		super(client as any, 'serializers', Serializer as any);
		client.registerStore(this);
	}
}
