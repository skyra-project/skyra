import { Message, Permissions, Structures, TextChannel } from 'discord.js';
import { TextBasedExtension, TextBasedExtensions } from './base/TextBasedExtension';

const snipes = new WeakMap<TextChannel, SnipedMessage>();

export class SkyraTextChannel extends TextBasedExtension(Structures.get('TextChannel')) {
	public async fetchLanguage() {
		const lang: string = await this.client.fetchLanguage(({ channel: this, guild: this.guild } as unknown) as Message);
		return lang ?? this.guild?.preferredLocale ?? this.client.i18n.options?.defaultName ?? 'en-US';
	}

	public set sniped(value: Message | null) {
		const previous = snipes.get(this);
		if (typeof previous !== 'undefined') this.client.clearTimeout(previous.timeout);

		if (value === null) {
			snipes.delete(this);
		} else {
			const next: SnipedMessage = {
				message: value,
				timeout: this.client.setTimeout(() => snipes.delete(this), 15000)
			};
			snipes.set(this, next);
		}
	}

	public get sniped() {
		const current = snipes.get(this);
		return typeof current === 'undefined' ? null : current.message;
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

export interface SnipedMessage {
	message: Message;
	timeout: NodeJS.Timeout;
}

declare module 'discord.js' {
	export interface TextChannel extends TextBasedExtensions {
		fetchLanguage(): Promise<string>;
		sniped: Message | null;
		readonly attachable: boolean;
		readonly embedable: boolean;
		readonly postable: boolean;
		readonly readable: boolean;
		toString(): string;
	}
}

Structures.extend('TextChannel', () => SkyraTextChannel);
