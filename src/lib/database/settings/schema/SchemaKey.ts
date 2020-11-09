import { SkyraClient } from '@lib/SkyraClient';
import type { AnyObject, CustomGet } from '@lib/types';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { Awaited } from '@sapphire/utilities';
import { Language } from 'klasa';
import { container } from 'tsyringe';
import type { GuildEntity } from '../../entities/GuildEntity';
import { ISchemaValue } from '../base/ISchemaValue';
import type { Serializer, SerializerUpdateContext } from '../structures/Serializer';
import { SchemaGroup } from './SchemaGroup';

export class SchemaKey<K extends keyof GuildEntity = keyof GuildEntity> implements ISchemaValue {
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
	public property: K;

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

	/**
	 * The default value for this key.
	 */
	public default: unknown;

	/**
	 * The parent group that holds this key.
	 */
	public parent: SchemaGroup | null = null;

	public constructor(options: ConfigurableKeyValueOptions) {
		this.description = options.description;
		this.maximum = options.maximum;
		this.minimum = options.minimum;
		this.inclusive = options.inclusive ?? false;
		this.name = options.name;
		this.property = options.property as K;
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

	public parse(settings: GuildEntity, language: Language, value: string): Awaited<GuildEntity[K]> {
		const { serializer } = this;
		const context = this.getContext(settings, language);
		return serializer.parse(value, context);
	}

	public stringify(settings: GuildEntity, language: Language, value: GuildEntity[K]): string {
		const { serializer } = this;
		const context = this.getContext(settings, language);
		return serializer.stringify(value, context);
	}

	public display(settings: GuildEntity, language: Language): string {
		const { serializer } = this;
		const context = this.getContext(settings, language);

		if (this.array) {
			const values = settings[this.property] as readonly any[];
			return values.length === 0 ? 'None' : `[ ${values.map((value) => serializer.stringify(value, context)).join(' | ')} ]`;
		}

		const value = settings[this.property];
		return value === null ? language.get(LanguageKeys.Commands.Admin.ConfSettingNotSet) : serializer.stringify(value, context);
	}

	public getContext(settings: GuildEntity, language: Language): SerializerUpdateContext {
		const context: SerializerUpdateContext = {
			entity: settings,
			guild: settings.guild,
			language,
			entry: this
		};

		return context;
	}
}

export type ConfigurableKeyValueOptions = Pick<
	SchemaKey,
	'description' | 'maximum' | 'minimum' | 'inclusive' | 'name' | 'property' | 'target' | 'type' | 'array' | 'default'
>;
