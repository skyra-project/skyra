/* eslint-disable @typescript-eslint/class-literal-property-style */
import { Structures } from 'discord.js';
import { StringMap, TFunction, TOptions } from 'i18next';
import { TextBasedExtension, TextBasedExtensions } from './base/TextBasedExtensions';

export class SkyraDMChannel extends TextBasedExtension(Structures.get('DMChannel')) {
	public fetchLanguage(): Promise<string> {
		// @ts-expect-error This is an incomplete Message, but the data is sufficient.
		return this.client.i18n.resolveNameFromMessage({ channel: this, guild: null });
	}

	public async fetchT() {
		const language = this.client.i18n.languages.get(await this.fetchLanguage());
		if (language) return language;
		throw new Error(`The language '${language}' is not available.`);
	}

	public async fetchLanguageKey(key: string, replace?: Record<string, unknown>, options?: TOptions<StringMap>): Promise<string> {
		return this.client.i18n.resolveValue(await this.fetchLanguage(), key, replace, options);
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
		fetchLanguage(): Promise<string>;
		fetchLanguageKey(key: string, replace?: Record<string, unknown>, options?: TOptions<StringMap>): Promise<string>;
		fetchT(): Promise<TFunction>;
		readonly attachable: boolean;
		readonly embedable: boolean;
		readonly postable: boolean;
		readonly readable: boolean;
		toString(): string;
	}
}

Structures.extend('DMChannel', () => SkyraDMChannel);
