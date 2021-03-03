import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { SkyraArgs } from '#lib/structures';
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

export async function set(settings: GuildEntity, key: SchemaKey, args: SkyraArgs) {
	const parsed = await key.parse(settings, args);
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
			throw args.t(LanguageKeys.Settings.Gateway.DuplicateValue, {
				path: key.name,
				value: key.stringify(settings, args.t, parsed)
			});
		}

		Reflect.set(settings, key.property, parsed);
	}

	return settings.getLanguage();
}

export async function remove(settings: GuildEntity, key: SchemaKey, args: SkyraArgs) {
	const parsed = await key.parse(settings, args);
	if (key.array) {
		const values = Reflect.get(settings, key.property) as any[];
		const { serializer } = key;
		const index = values.findIndex((value) => serializer.equals(value, parsed));
		if (index === -1) {
			throw args.t(LanguageKeys.Settings.Gateway.MissingValue, {
				path: key.name,
				value: key.stringify(settings, args.t, parsed)
			});
		}

		values.splice(index, 1);
	} else {
		Reflect.set(settings, key.property, key.default);
	}

	return settings.getLanguage();
}

export function reset(settings: GuildEntity, key: SchemaKey) {
	const language = settings.getLanguage();
	Reflect.set(settings, key.property, key.default);
	return language;
}
