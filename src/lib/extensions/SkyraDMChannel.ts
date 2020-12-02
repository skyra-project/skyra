/* eslint-disable @typescript-eslint/class-literal-property-style */
import { Structures } from 'discord.js';
import { Language } from 'klasa';
import { TextBasedExtension, TextBasedExtensions } from './base/TextBasedExtensions';

export class SkyraDMChannel extends TextBasedExtension(Structures.get('DMChannel')) {
	public async fetchLanguage() {
		const languageKey = await this.client.fetchLanguage({ channel: this, guild: null });
		const language = this.client.languages.get(languageKey);
		if (language) return language;
		throw new Error(`The language '${language}' is not available.`);
	}

	public get attachable() {
		return true;
	}

	public get embedable() {
		return true;
	}

	public get postable() {
		return true;
	}

	public get readable() {
		return true;
	}
}

declare module 'discord.js' {
	export interface DMChannel extends TextBasedExtensions {
		fetchLanguage(): Promise<Language>;
		readonly attachable: boolean;
		readonly embedable: boolean;
		readonly postable: boolean;
		readonly readable: boolean;
		toString(): string;
	}
}

Structures.extend('DMChannel', () => SkyraDMChannel);
