import { SkyraClient } from '@lib/SkyraClient';
import type { AnyObject, CustomGet } from '@lib/types';
import { container } from 'tsyringe';
import type { GuildEntity } from '../entities/GuildEntity';
import type { Serializer } from './structures/Serializer';

export class ConfigurableKeyValue<K extends keyof GuildEntity = keyof GuildEntity> {
	/**
	 * The i18n key for the configuration key.
	 */
	public description: CustomGet<string, string>;

	/**
	 * The maximum value for the configuration key.
	 */
	public maximum: number | null;

	/**
	 * The minimum value for the configuration key.
	 */
	public minimum: number | null;

	/**
	 * Whether or not the range checks are inclusive.
	 */
	public inclusive: boolean;

	/**
	 * The visible name of the configuration key.
	 */
	public name: K;

	/**
	 * The property from the TypeORM entity.
	 */
	public property: string;

	/**
	 * The class this targets.
	 */
	public target: AnyObject;

	/**
	 * The type of the value this property accepts.
	 */
	public type: string;

	/**
	 * Whether or not this accepts multiple values.
	 */
	public array: boolean;

	public constructor(options: ConfigurableKeyValueOptions) {
		this.description = options.description;
		this.maximum = options.maximum;
		this.minimum = options.minimum;
		this.inclusive = options.inclusive ?? false;
		this.name = options.name as K;
		this.property = options.property;
		this.target = options.target;
		this.type = options.type;
		this.array = options.array;
	}

	public get client(): SkyraClient {
		return container.resolve<SkyraClient>('SkyraClient');
	}

	public get serializer(): Serializer<GuildEntity[K]> {
		const value = this.client.settings.serializers.get(this.type);
		if (typeof value === 'undefined') throw new Error(`The serializer for '${this.type}' does not exist.`);
		return value as Serializer<GuildEntity[K]>;
	}
}

export type ConfigurableKeyValueOptions = Pick<
	ConfigurableKeyValue,
	'description' | 'maximum' | 'minimum' | 'inclusive' | 'name' | 'property' | 'target' | 'type' | 'array'
>;
