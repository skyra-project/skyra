import { toTitleCase } from '@sapphire/utilities';
import { Guild } from 'discord.js';
import { Schema, SchemaEntry, SettingsFolder } from 'klasa';

export const configurableSchemaKeys = new Map<string, Schema | SchemaEntry>();

export function isSchemaFolder(schemaOrEntry: Schema | SchemaEntry): schemaOrEntry is Schema {
	return schemaOrEntry.type === 'Folder';
}

export function isSchemaEntry(schemaOrEntry: Schema | SchemaEntry): schemaOrEntry is SchemaEntry {
	return schemaOrEntry.type !== 'Folder';
}

export function displayFolder(settings: SettingsFolder) {
	const array: string[] = [];
	const folders: string[] = [];
	const sections = new Map<string, string[]>();
	let longest = 0;
	for (const [key, value] of settings.schema.entries()) {
		if (!configurableSchemaKeys.has(value.path)) continue;

		if (value.type === 'Folder') {
			folders.push(`// ${key}`);
		} else {
			const values = sections.get(value.type) || [];
			values.push(key);

			if (key.length > longest) longest = key.length;
			if (values.length === 1) sections.set(value.type, values);
		}
	}
	if (folders.length) array.push('= Folders =', ...folders.sort(), '');
	if (sections.size) {
		for (const keyType of [...sections.keys()].sort()) {
			array.push(
				`= ${toTitleCase(keyType)}s =`,
				...sections
					.get(keyType)!
					.sort()
					.map(
						(key) =>
							`${key.padEnd(longest)} :: ${displayEntry(
								settings.schema.get(key) as SchemaEntry,
								settings.get(key),
								settings.base!.target as Guild
							)}`
					),
				''
			);
		}
	}
	return array.join('\n');
}

export function displayEntry(entry: SchemaEntry, value: unknown, guild: Guild) {
	return entry.array ? displayEntryMultiple(entry, value as readonly unknown[], guild) : displayEntrySingle(entry, value, guild);
}

export function displayEntrySingle(entry: SchemaEntry, value: unknown, guild: Guild) {
	return value === null ? guild.language.get('commandConfSettingNotSet') : entry.serializer!.stringify(value, guild);
}

export function displayEntryMultiple(entry: SchemaEntry, values: readonly unknown[], guild: Guild) {
	return values.length === 0 ? 'None' : `[ ${values.map((value) => displayEntrySingle(entry, value, guild)).join(' | ')} ]`;
}

export function initConfigurableSchema(folder: Schema) {
	configurableSchemaKeys.clear();
	if (initFolderConfigurableRecursive(folder)) configurableSchemaKeys.set(folder.path, folder);
}

function initFolderConfigurableRecursive(folder: Schema) {
	const previousConfigurableCount = configurableSchemaKeys.size;
	for (const value of folder.values()) {
		if (value instanceof Schema) {
			if (initFolderConfigurableRecursive(value)) configurableSchemaKeys.set(value.path, value);
		} else if (value.configurable) {
			configurableSchemaKeys.set(value.path, value);
		}
	}

	return previousConfigurableCount !== configurableSchemaKeys.size;
}
