import { CustomFunctionGet, CustomGet, NonNullObject } from '#lib/types';
import { Constructable, Message, MessageAdditions, MessageOptions, PartialTextBasedChannelFields, SplitOptions } from 'discord.js';
import { Language } from 'klasa';

export interface ISendable {
	send: PartialTextBasedChannelFields['send'];
	fetchLanguage(): Promise<Language>;
}

export function TextBasedExtension<Base extends NonNullObject>(Ctor: Constructable<Base & ISendable>) {
	// @ts-expect-error: Dumb TypeScript error
	return class extends Ctor {
		public async fetchLocale(key: string, ...localeArgs: readonly unknown[]) {
			const language = await this.fetchLanguage();
			// @ts-expect-error: Some weird type error here
			return language.get(key as any, ...localeArgs);
		}

		public sendLocale<K extends string, TReturn>(key: CustomGet<K, TReturn>, options?: MessageOptions | MessageAdditions): Promise<Message>;
		public sendLocale<K extends string, TReturn>(
			key: CustomGet<K, TReturn>,
			options?: (MessageOptions & { split?: false }) | MessageAdditions
		): Promise<Message>;

		public sendLocale<K extends string, TReturn>(
			key: CustomGet<K, TReturn>,
			options?: (MessageOptions & { split: true | SplitOptions }) | MessageAdditions
		): Promise<Message[]>;

		public sendLocale<K extends string, TArgs, TReturn>(
			key: CustomFunctionGet<K, TArgs, TReturn>,
			localeArgs: [TArgs],
			options?: MessageOptions | MessageAdditions
		): Promise<Message>;

		public sendLocale<K extends string, TArgs, TReturn>(
			key: CustomFunctionGet<K, TArgs, TReturn>,
			localeArgs: [TArgs],
			options?: (MessageOptions & { split?: false }) | MessageAdditions
		): Promise<Message>;

		public sendLocale<K extends string, TArgs, TReturn>(
			key: CustomFunctionGet<K, TArgs, TReturn>,
			localeArgs: [TArgs],
			options?: (MessageOptions & { split: true | SplitOptions }) | MessageAdditions
		): Promise<Message[]>;

		public async sendLocale(key: string, args: any = [], options: any = {}) {
			if (!Array.isArray(args)) [options, args] = [args, []];
			// @ts-expect-error: Some weird type error here
			return this.send(APIMessage.transformOptions(await this.fetchLocale(key, ...args), undefined, options)) as Promise<any>;
		}
	};
}

export interface TextBasedExtensions {
	fetchLocale<K extends string, TReturn>(value: CustomGet<K, TReturn>): Promise<TReturn>;
	fetchLocale<K extends string, TArgs, TReturn>(value: CustomFunctionGet<K, TArgs, TReturn>, args: TArgs): Promise<TReturn>;
	sendLocale<K extends string, TReturn>(key: CustomGet<K, TReturn>, options?: MessageOptions | MessageAdditions): Promise<Message>;
	sendLocale<K extends string, TReturn>(
		key: CustomGet<K, TReturn>,
		// eslint-disable-next-line @typescript-eslint/unified-signatures
		options?: (MessageOptions & { split?: false }) | MessageAdditions
	): Promise<Message>;
	sendLocale<K extends string, TReturn>(
		key: CustomGet<K, TReturn>,
		options?: (MessageOptions & { split: true | SplitOptions }) | MessageAdditions
	): Promise<Message[]>;
	sendLocale<K extends string, TArgs, TReturn>(
		key: CustomFunctionGet<K, TArgs, TReturn>,
		localeArgs: [TArgs],
		options?: MessageOptions | MessageAdditions
	): Promise<Message>;
	sendLocale<K extends string, TArgs, TReturn>(
		key: CustomFunctionGet<K, TArgs, TReturn>,
		localeArgs: [TArgs],
		// eslint-disable-next-line @typescript-eslint/unified-signatures
		options?: (MessageOptions & { split?: false }) | MessageAdditions
	): Promise<Message>;
	sendLocale<K extends string, TArgs, TReturn>(
		key: CustomFunctionGet<K, TArgs, TReturn>,
		localeArgs: [TArgs],
		options?: (MessageOptions & { split: true | SplitOptions }) | MessageAdditions
	): Promise<Message[]>;
}
