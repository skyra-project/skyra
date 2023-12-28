import type { GuildEntity } from '#lib/database/entities/GuildEntity';
import type { ISchemaValue } from '#lib/database/settings/base/ISchemaValue';
import type { SchemaGroup } from '#lib/database/settings/schema/SchemaGroup';
import type { Serializer } from '#lib/database/settings/structures/Serializer';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { SkyraArgs } from '#lib/structures';
import type { CustomGet } from '#lib/types';
import { container } from '@sapphire/framework';
import type { TFunction } from '@sapphire/plugin-i18next';
import { isNullish, type NonNullObject } from '@sapphire/utilities';

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
	public target: NonNullObject;

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
	 * Whether this key should only be configurable on the dashboard
	 */
	public dashboardOnly: boolean;

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
		this.default = options.default;
		this.dashboardOnly = options.dashboardOnly ?? false;
	}

	public get serializer(): Serializer<GuildEntity[K]> {
		const value = container.settings.serializers.get(this.type);
		if (typeof value === 'undefined') throw new Error(`The serializer for '${this.type}' does not exist.`);
		return value as Serializer<GuildEntity[K]>;
	}

	public async parse(settings: GuildEntity, args: SkyraArgs): Promise<GuildEntity[K]> {
		const { serializer } = this;
		const context = this.getContext(settings, args.t);

		const result = await serializer.parse(args, context);
		return result.match({
			ok: (value) => value,
			err: (error) => {
				throw error.message;
			}
		});
	}

	public stringify(settings: GuildEntity, t: TFunction, value: GuildEntity[K]): string {
		const { serializer } = this;
		const context = this.getContext(settings, t);
		return serializer.stringify(value, context);
	}

	public display(settings: GuildEntity, t: TFunction): string {
		const { serializer } = this;
		const context = this.getContext(settings, t);

		if (this.array) {
			const values = settings[this.property] as readonly any[];
			return isNullish(values) || values.length === 0
				? 'None'
				: `[ ${values.map((value) => serializer.stringify(value, context)).join(' | ')} ]`;
		}

		const value = settings[this.property];
		return isNullish(value) ? t(LanguageKeys.Commands.Admin.ConfSettingNotSet) : serializer.stringify(value, context);
	}

	public getContext(settings: GuildEntity, language: TFunction): Serializer.UpdateContext {
		return {
			entity: settings,
			guild: settings.guild,
			t: language,
			entry: this
		} satisfies Serializer.UpdateContext;
	}
}

export type ConfigurableKeyValueOptions = Pick<
	SchemaKey,
	'description' | 'maximum' | 'minimum' | 'inclusive' | 'name' | 'property' | 'target' | 'type' | 'array' | 'default' | 'dashboardOnly'
>;
