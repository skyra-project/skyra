import { KlasaUser, KlasaMessage } from 'klasa';

export interface SuggestionData {
	author: KlasaUser | null;
	message: KlasaMessage;
	id: number;
}
