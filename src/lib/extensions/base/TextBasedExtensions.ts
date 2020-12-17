import { NonNullObject } from '#lib/types';
import { APIMessage, Constructable, Message, MessageAdditions, MessageOptions, PartialTextBasedChannelFields, SplitOptions } from 'discord.js';
import { StringMap, TFunction, TOptions } from 'i18next';

export interface ISendable {
	send: PartialTextBasedChannelFields['send'];
	fetchLanguage(): Promise<string>;
	fetchLanguageKey(key: string, replace?: Record<string, unknown>, options?: TOptions<StringMap>): Promise<string>;
	fetchT(): Promise<TFunction>;
}

export function TextBasedExtension<Base extends NonNullObject>(Ctor: Constructable<Base & ISendable>) {
	// @ts-expect-error: Dumb TypeScript error
	return class extends Ctor {
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
				typeof valuesOrOptions === 'undefined' || Array.isArray(valuesOrOptions)
					? [valuesOrOptions ?? [], rawOptions ?? {}]
					: [[], valuesOrOptions as MessageOptions];
			// @ts-expect-error Will be fixed with Sapphire. Just let it be for now.
			const content = await this.fetchLanguageKey(key, ...values);
			return this.send(APIMessage.transformOptions(content, undefined, options));
		}
	};
}

export interface TextBasedExtensions {
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
