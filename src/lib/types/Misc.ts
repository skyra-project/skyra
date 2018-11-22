import { KlasaMessage } from 'klasa';
import { SkyraGuild } from '../extensions/SkyraGuild';
import { SkyraClient } from '../SkyraClient';

/**
 * The constructor type
 */
export type ConstructorType<V> = new (...args: any[]) => V;

/**
 * The AeliaMessage type
 */
export interface AeliaMessage extends KlasaMessage {
	guild: SkyraGuild;
	client: SkyraClient;
}

export interface EmojiData {
	name: string;
	id: string | null;
	animated: boolean;
}
