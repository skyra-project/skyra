import English from '@root/languages/en-US';
import { Client } from 'klasa';
import { createLanguageStore } from './MockLanguageStore';

export const client = new Client();

client.languages = createLanguageStore(client, 'english', English);
