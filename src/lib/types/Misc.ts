/**
 * The constructor type
 */
export type ConstructorType<V> = new (...args: any[]) => V;

export interface EmojiData {
	name: string;
	id: string | null;
	animated: boolean;
}

export interface GuildSettingsDisabledCommandsChannels extends Array<{ channel: string; commands: string[] }> { }
export interface GuildSettingsStickyRoles extends Array<{ user: string; roles: string[] }> { }
export interface GuildSettingsRolesAuto extends Array<{ id: string; points: number }> { }
export interface GuildSettingsRolesReactions extends Array<{ emoji: string; role: string }> { }
export interface GuildSettingsTriggerAlias extends Array<{ input: string; output: string }> { }
export interface GuildSettingsTriggerIncludes extends Array<{ action: 'react'; input: string; output: string }> { }
export interface GuildSettingsTags extends Array<[string, string]> { }
