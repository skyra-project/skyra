import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import type { GuildEntity } from '../entities/GuildEntity';
import type { ISchemaValue } from './base/ISchemaValue';
import type { SchemaGroup } from './schema/SchemaGroup';
import type { SchemaKey } from './schema/SchemaKey';

export function isSchemaGroup(groupOrKey: ISchemaValue): groupOrKey is SchemaGroup {
	return groupOrKey.type === 'Group';
}

export function isSchemaKey(groupOrKey: ISchemaValue): groupOrKey is SchemaKey {
	return groupOrKey.type !== 'Group';
}

export async function set(settings: GuildEntity, key: SchemaKey, value: string) {
	const language = settings.getLanguage();

	const parsed = await key.parse(settings, language, value);
	if (key.array) {
		const values = Reflect.get(settings, key.property) as any[];
		const { serializer } = key;
		const index = values.findIndex((value) => serializer.equals(value, parsed));
		if (index === -1) values.push(parsed);
		else values[index] = parsed;
	} else {
		const value = Reflect.get(settings, key.property);
		const { serializer } = key;
		if (serializer.equals(value, parsed)) {
			throw language.get(LanguageKeys.Settings.Gateway.DuplicateValue, {
				path: key.name,
				value: key.stringify(settings, language, parsed)
			});
		}

		Reflect.set(settings, key.property, parsed);
	}

	return language;
}

export async function remove(settings: GuildEntity, key: SchemaKey, value: string) {
	const language = settings.getLanguage();

	const parsed = await key.parse(settings, language, value);
	if (key.array) {
		const values = Reflect.get(settings, key.property) as any[];
		const { serializer } = key;
		const index = values.findIndex((value) => serializer.equals(value, parsed));
		if (index === -1) {
			throw language.get(LanguageKeys.Settings.Gateway.MissingValue, {
				path: key.name,
				value: key.stringify(settings, language, parsed)
			});
		}

		values.splice(index, 1);
	} else {
		Reflect.set(settings, key.property, key.default);
	}

	return language;
}

export function reset(settings: GuildEntity, key: SchemaKey) {
	const language = settings.getLanguage();
	Reflect.set(settings, key.property, key.default);
	return language;
}
