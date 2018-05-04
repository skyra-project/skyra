import { Collection } from 'discord.js';
import { OverwatchProfile } from './OverwatchProfile';
import { Client } from 'klasa';

export class OverwatchProfileStore extends Collection<string, OverwatchProfile> {

	public constructor(client: Client);
	public readonly client: Client;
	public create(name: string): OverwatchProfile;

	static createInstance(client: Client): OverwatchProfileStore;

}
