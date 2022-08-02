import { Store } from '@sapphire/pieces';
import { Listener } from './Listener.js';

export class ListenerStore extends Store<Listener> {
	public constructor() {
		// TODO: https://github.com/sapphiredev/pieces/pull/230
		super(Listener as any, { name: 'listeners' });
	}
}
