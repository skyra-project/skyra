import { CustomFunctionGet, CustomGet, NonNullObject } from '#lib/types';
import { Client, Constructable, Message, MessageAdditions, MessageOptions, PartialTextBasedChannelFields, SplitOptions } from 'discord.js';
import { TFunction } from 'i18next';

export interface ISendable {
	client: Client;
	send: PartialTextBasedChannelFields['send'];
	fetchLanguage(): Promise<string>;
}

export function TextBasedExtension<Base extends NonNullObject>(Ctor: Constructable<Base & ISendable>) {
	// @ts-expect-error: Dumb TypeScript error
	return class extends Ctor {
		public async fetchT(): Promise<TFunction> {
			return this.client.i18n.fetchT(await this.fetchLanguage());
		}

		public async resolveKey(key: string, ...values: readonly any[]): Promise<string> {
			return this.client.i18n.fetchLocale(await this.fetchLanguage(), key, ...values);
		}

		public sendTranslated(
			key: string,
			values?: readonly unknown[],
			options?: MessageOptions | (MessageOptions & { split?: false }) | MessageAdditions
		): Promise<Message>;

		public sendTranslated(
			key: string,
			values?: readonly unknown[],
			options?: MessageOptions & { split: true | SplitOptions }
		): Promise<Message[]>;

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
	};
}

export interface TextBasedExtensions {
	fetchT(): Promise<TFunction>;
	resolveKey(key: string, ...values: readonly any[]): Promise<string>;

	fetchLocale<K extends string, TReturn>(value: CustomGet<K, TReturn>): Promise<TReturn>;
	fetchLocale<K extends string, TArgs, TReturn>(value: CustomFunctionGet<K, TArgs, TReturn>, args: TArgs): Promise<TReturn>;
	sendTranslated(
		key: string,
		values?: readonly unknown[],
		options?: MessageOptions | (MessageOptions & { split?: false }) | MessageAdditions
	): Promise<Message>;
	sendTranslated(key: string, values?: readonly unknown[], options?: MessageOptions & { split: true | SplitOptions }): Promise<Message[]>;
	sendTranslated(key: string, options?: MessageOptions | (MessageOptions & { split?: false }) | MessageAdditions): Promise<Message>;
	sendTranslated(key: string, options?: MessageOptions & { split: true | SplitOptions }): Promise<Message[]>;
	sendTranslated(
		key: string,
		valuesOrOptions?: readonly unknown[] | MessageOptions | MessageAdditions,
		rawOptions?: MessageOptions
	): Promise<Message | Message[]>;
}
