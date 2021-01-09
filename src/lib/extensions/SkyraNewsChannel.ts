import { Message, Permissions, Structures } from 'discord.js';
import { TextBasedExtension, TextBasedExtensions } from './base/TextBasedExtension';

export class SkyraNewsChannel extends TextBasedExtension(Structures.get('NewsChannel')) {
	public async fetchLanguage() {
		const lang: string = await this.client.fetchLanguage(({ channel: this, guild: this.guild } as unknown) as Message);
		return lang ?? this.guild?.preferredLocale ?? this.client.i18n.options?.defaultName ?? 'en-US';
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
		readonly attachable: boolean;
		readonly embedable: boolean;
		readonly postable: boolean;
		readonly readable: boolean;
		toString(): string;
	}
}

Structures.extend('NewsChannel', () => SkyraNewsChannel);
