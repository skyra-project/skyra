/* eslint-disable @typescript-eslint/unified-signatures */
import { CustomFunctionGet, CustomGet } from '#lib/types';
import { Message, Structures, TextChannel, Permissions, APIMessage, MessageOptions, MessageAdditions, SplitOptions } from 'discord.js';

const snipes = new WeakMap<TextChannel, SnipedMessage>();

export class SkyraTextChannel extends Structures.get('TextChannel') {
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
		return this.send(APIMessage.transformOptions(await this.fetchLocale(key, ...args), undefined, options));
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
	export interface TextChannel {
		sniped: Message | null;
		readonly attachable: boolean;
		readonly embedable: boolean;
		readonly postable: boolean;
		readonly readable: boolean;
		sendLocale<K extends string, TReturn>(key: CustomGet<K, TReturn>, options?: MessageOptions | MessageAdditions): Promise<Message>;
		sendLocale<K extends string, TReturn>(
			key: CustomGet<K, TReturn>,
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
			options?: (MessageOptions & { split?: false }) | MessageAdditions
		): Promise<Message>;
		sendLocale<K extends string, TArgs, TReturn>(
			key: CustomFunctionGet<K, TArgs, TReturn>,
			localeArgs: [TArgs],
			options?: (MessageOptions & { split: true | SplitOptions }) | MessageAdditions
		): Promise<Message[]>;
		toString(): string;
	}
}

Structures.extend('TextChannel', () => SkyraTextChannel);
