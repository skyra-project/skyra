import { Store } from '@sapphire/pieces';
import { Listener } from './Listener.js';

export class ListenerStore extends Store<Listener> {
	public constructor() {
		super(Listener as any, { name: 'listeners' });
	}
}
