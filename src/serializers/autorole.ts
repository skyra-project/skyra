import { RolesAuto, Serializer, SerializerUpdateContext } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { Awaited, isObject } from '@sapphire/utilities';

export class UserSerializer extends Serializer<RolesAuto> {
	public async parse(args: Serializer.Args) {
		const role = await args.pickResult('role');
		if (!role.success) {
			return this.error(args.t(LanguageKeys.Resolvers.InvalidRole, { name: 'role' }));
		}

		const points = await args.pickResult('integer');
		if (!points.success) {
			return this.error(args.t(LanguageKeys.Resolvers.InvalidInt, { name: 'points' }));
		}

		return this.ok({ id: role.value.id, points: points.value });
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
