import { Permissions, Structures } from 'discord.js';
import { Language } from 'klasa';
import { TextBasedExtension, TextBasedExtensions } from './base/TextBasedExtensions';

export class SkyraNewsChannel extends TextBasedExtension(Structures.get('NewsChannel')) {
	public async fetchLanguage() {
		const languageKey = await this.client.fetchLanguage({ channel: this, guild: this.guild });
		const language = this.client.languages.get(languageKey);
		if (language) return language;
		throw new Error(`The language '${language}' is not available.`);
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
		fetchLanguage(): Promise<Language>;
		readonly attachable: boolean;
		readonly embedable: boolean;
		readonly postable: boolean;
		readonly readable: boolean;
		toString(): string;
	}
}

Structures.extend('NewsChannel', () => SkyraNewsChannel);
