import type { Message, User } from 'discord.js';

export interface SuggestionData {
	author: User | null;
	message: Message;
	id: number;
}
