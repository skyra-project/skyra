import { RolesAuto, Serializer, SerializerUpdateContext } from '@lib/database';
import { isObject } from '@sapphire/utilities';

export default class extends Serializer<RolesAuto> {
	public parse(value: string, context: SerializerUpdateContext): RolesAuto | Promise<RolesAuto> {
		const [id, rawPoints] = value.split(' ');
		if (!id || !context.entity.guild.roles.cache.has(id)) {
			// TODO(kyranet): Localize this.
			throw new Error('id must be a valid role.');
		}

		const points = Number(rawPoints);
		if (!Number.isSafeInteger(points)) {
			// TODO(kyranet): Localize this.
			throw new Error('points must be a valid integer.');
		}

		return { id, points };
	}

	public isValid(value: RolesAuto): boolean {
		return isObject(value) && Object.keys(value).length === 2 && typeof value.id === 'string' && typeof value.points === 'number';
	}

	public stringify(value: RolesAuto) {
		return `[${value.id} -> ${value.points.toLocaleString()}]`;
	}
}
