import { CustomGet } from './settings/Shared';
import { PermissionString } from 'discord.js';
import { LanguageKeys } from './Languages';

declare module 'discord.js' {

	interface MessageExtendablesAskOptions {
		time?: number;
		max?: number;
	}

	interface Message {
		prompt(content: string, time?: number): Promise<Message>;
		ask(options?: MessageOptions, promptOptions?: MessageExtendablesAskOptions): Promise<boolean>;
		ask(content: string, options?: MessageOptions, promptOptions?: MessageExtendablesAskOptions): Promise<boolean>;
		alert(content: string, timer?: number): Promise<Message>;
		alert(content: string, options?: number | MessageOptions, timer?: number): Promise<Message>;
		nuke(time?: number): Promise<Message>;
	}

	interface GuildMember {
		fetchRank(): Promise<number>;
	}

	interface User {
		profileLevel: number;
		fetchRank(): Promise<number>;
	}

	interface MessageEmbed {
		splitFields(content: string | string[]): this;
	}

}

interface Fn {
	(...args: readonly any[]): unknown;
}

export type LanguageKeysSimple = {
	[K in keyof LanguageKeys]: LanguageKeys[K] extends Fn ? never : K;
}[keyof LanguageKeys];

export type LanguageKeysComplex = {
	[K in keyof LanguageKeys]: LanguageKeys[K] extends Fn ? K : never;
}[keyof LanguageKeys];

declare module 'klasa' {

	interface Language {
		PERMISSIONS: Record<PermissionString, string>;
		HUMAN_LEVELS: Record<0 | 1 | 2 | 3 | 4, string>;
		duration(time: number): string;

		get<T extends LanguageKeysSimple>(term: T): LanguageKeys[T];
		get<T extends LanguageKeysComplex>(term: T, ...args: Parameters<LanguageKeys[T]>): ReturnType<LanguageKeys[T]>;
		tget<T extends LanguageKeysSimple>(term: T): LanguageKeys[T];
		tget<T extends LanguageKeysComplex>(term: T, ...args: Parameters<LanguageKeys[T]>): ReturnType<LanguageKeys[T]>;
		retrieve<T extends LanguageKeysSimple>(term: T): LanguageKeys[T];
		retrieve<T extends LanguageKeysComplex>(term: T, ...args: Parameters<LanguageKeys[T]>): ReturnType<LanguageKeys[T]>;
	}

	interface SettingsFolder {
		get<K extends string, S>(key: CustomGet<K, S>): S;
		get(key: string): SettingsFolder | SettingsValue | readonly SettingsValue[];
		increase(key: string, value: number): Promise<SettingsFolderUpdateResult>;
		decrease(key: string, value: number): Promise<SettingsFolderUpdateResult>;
	}

}

declare module 'klasa-dashboard-hooks' {

	interface AuthData {
		user_id: string;
	}

}
