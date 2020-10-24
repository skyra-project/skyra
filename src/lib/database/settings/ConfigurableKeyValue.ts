import { SkyraClient } from '@lib/SkyraClient';
import { CustomGet } from '@lib/types/Shared';
import { O } from '@utils/constants';
import { container } from 'tsyringe';
import { Serializer } from './structures/Serializer';

export class ConfigurableKeyValue {
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
	public name: string;

	/**
	 * The property from the TypeORM entity.
	 */
	public property: string;

	/**
	 * The class this targets.
	 */
	public target: O;

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
		this.name = options.name;
		this.property = options.property;
		this.target = options.target;
		this.type = options.type;
		this.array = options.array;
	}

	public get client(): SkyraClient {
		return container.resolve<SkyraClient>('SkyraClient');
	}

	public get serializer(): Serializer {
		const value = this.client.settings.serializers.get(this.type);
		if (typeof value === 'undefined') throw new Error(`The serializer for '${this.type}' does not exist.`);
		return value;
	}
}

export type ConfigurableKeyValueOptions = Pick<
	ConfigurableKeyValue,
	'description' | 'maximum' | 'minimum' | 'inclusive' | 'name' | 'property' | 'target' | 'type' | 'array'
>;
