import { I18nextChannelImplementation, I18nextImplemented, I18nextMessageImplementation } from '@sapphire/plugin-i18next';
import { Message, MessageAdditions, MessageOptions, SplitOptions, Structures } from 'discord.js';

export class SkyraMessage extends I18nextImplemented(Structures.get('Message')) {
	public async fetchLanguage(): Promise<string> {
		return this._fetchLanguage(this.guild, this.channel, this.author);
	}

	public sendTranslated(
		key: string,
		values?: readonly unknown[],
		options?: MessageOptions | (MessageOptions & { split?: false }) | MessageAdditions
	): Promise<Message>;

	public sendTranslated(key: string, values?: readonly unknown[], options?: MessageOptions & { split: true | SplitOptions }): Promise<Message[]>;
	public sendTranslated(key: string, options?: MessageOptions | (MessageOptions & { split?: false }) | MessageAdditions): Promise<Message>;
	public sendTranslated(key: string, options?: MessageOptions & { split: true | SplitOptions }): Promise<Message[]>;
	public async sendTranslated(
		key: string,
		valuesOrOptions?: readonly unknown[] | MessageOptions | MessageAdditions,
		rawOptions?: MessageOptions
	): Promise<Message | Message[]> {
		const [values, options]: [readonly unknown[], MessageOptions] =
			valuesOrOptions === undefined || Array.isArray(valuesOrOptions)
				? [valuesOrOptions ?? [], rawOptions ?? {}]
				: [[], valuesOrOptions as MessageOptions];
		return this.send(await this.resolveKey(key, ...values), options);
	}
}

declare module 'discord.js' {
	export interface Message extends I18nextMessageImplementation, I18nextChannelImplementation {
		fetchLanguage(): Promise<string>;
	}
}

Structures.extend('Message', () => SkyraMessage);
