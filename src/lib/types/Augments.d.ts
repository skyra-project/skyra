import { CustomGet } from './settings/Shared';

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

declare module 'klasa' {

	interface Language {
		retrieve(key: string): unknown;
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
