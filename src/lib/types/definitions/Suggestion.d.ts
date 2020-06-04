import type { Message } from 'discord.js';
import type { KlasaUser } from 'klasa';

export interface SuggestionData {
	author: KlasaUser | null;
	message: Message;
	id: number;
}
