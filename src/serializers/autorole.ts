import { RolesAuto, Serializer, SerializerUpdateContext } from '@lib/database';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { Awaited, isObject } from '@sapphire/utilities';

export default class UserSerializer extends Serializer<RolesAuto> {
	public parse(value: string, context: SerializerUpdateContext): Awaited<RolesAuto> {
		const [id, rawPoints] = value.split(' ');
		if (!id || !context.guild.roles.cache.has(id)) {
			throw new Error(context.language.get(LanguageKeys.Resolvers.InvalidRole, { name: 'role' }));
		}

		const points = Number(rawPoints);
		if (!Number.isSafeInteger(points)) {
			throw new Error(context.language.get(LanguageKeys.Resolvers.InvalidInt, { name: 'points' }));
		}

		return { id, points };
	}

	public isValid(value: RolesAuto): Awaited<boolean> {
		return isObject(value) && Object.keys(value).length === 2 && typeof value.id === 'string' && typeof value.points === 'number';
	}

	public stringify(value: RolesAuto): string {
		return `[${value.id} -> ${value.points.toLocaleString()}]`;
	}

	public equals(left: RolesAuto, right: RolesAuto): boolean {
		return left.id === right.id && left.points === right.points;
	}
}
