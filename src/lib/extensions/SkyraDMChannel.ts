/* eslint-disable @typescript-eslint/class-literal-property-style */
import { cast } from '#utils/util';
import { Message, Structures } from 'discord.js';
import { TextBasedExtension, TextBasedExtensions } from './base/TextBasedExtension';

export class SkyraDMChannel extends TextBasedExtension(Structures.get('DMChannel')) {
	public async fetchLanguage() {
		const lang: string = await this.client.fetchLanguage(
			cast<Message>({ channel: this, guild: null })
		);
		return lang ?? this.client.i18n.options?.defaultName ?? 'en-US';
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
		readonly attachable: boolean;
		readonly embedable: boolean;
		readonly postable: boolean;
		readonly readable: boolean;
		toString(): string;
	}
}

Structures.extend('DMChannel', () => SkyraDMChannel);
