import { Message } from 'discord.js';
import { KlasaUser } from 'klasa';

export interface SuggestionData {
	author: KlasaUser | null;
	message: Message;
	id: number;
}
