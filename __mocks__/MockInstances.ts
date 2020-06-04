import { Client } from 'klasa';
import { createLanguageStore } from './MockLanguageStore';
import English from '../src/languages/en-US';

export const client = new Client();

client.languages = createLanguageStore(client, 'english', English);
