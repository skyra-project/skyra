import { RolesAuto, Serializer, SerializerUpdateContext } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { Awaited, isObject } from '@sapphire/utilities';

export default class UserSerializer extends Serializer<RolesAuto> {
	public parse(value: string, { t, guild }: SerializerUpdateContext) {
		const [id, rawPoints] = value.split(' ');
		if (!id || !guild.roles.cache.has(id)) {
			return this.error(t(LanguageKeys.Resolvers.InvalidRole, { name: 'role' }));
		}

		const points = Number(rawPoints);
		if (!Number.isSafeInteger(points)) {
			return this.error(t(LanguageKeys.Resolvers.InvalidInt, { name: 'points' }));
		}

		return this.ok({ id, points });
	}

	public isValid(value: RolesAuto): Awaited<boolean> {
		return isObject(value) && Object.keys(value).length === 2 && typeof value.id === 'string' && typeof value.points === 'number';
	}

	public stringify(value: RolesAuto, { t }: SerializerUpdateContext): string {
		return `[${value.id} -> ${t(LanguageKeys.Globals.NumberValue, { value: value.points })}]`;
	}

	public equals(left: RolesAuto, right: RolesAuto): boolean {
		return left.id === right.id && left.points === right.points;
	}
}
