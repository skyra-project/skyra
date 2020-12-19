import { Permissions, Structures } from 'discord.js';
import { StringMap, TFunction, TOptions } from 'i18next';
import { TextBasedExtension, TextBasedExtensions } from './base/TextBasedExtensions';

export class SkyraNewsChannel extends TextBasedExtension(Structures.get('NewsChannel')) {
	public fetchLanguage(): Promise<string> {
		// @ts-expect-error This is an incomplete Message, but the data is sufficient.
		return this.client.i18n.resolveNameFromMessage({ channel: this, guild: this.guild });
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
		return this.postable && this.permissionsFor(this.guild.me!)!.has(Permissions.FLAGS.ATTACH_FILES, false);
	}

	public get embedable() {
		return this.postable && this.permissionsFor(this.guild.me!)!.has(Permissions.FLAGS.EMBED_LINKS, false);
	}

	public get postable() {
		return this.permissionsFor(this.guild.me!)!.has([Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.SEND_MESSAGES], false);
	}

	public get readable() {
		return this.permissionsFor(this.guild.me!)!.has(Permissions.FLAGS.VIEW_CHANNEL, false);
	}
}

declare module 'discord.js' {
	export interface NewsChannel extends TextBasedExtensions {
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

Structures.extend('NewsChannel', () => SkyraNewsChannel);
