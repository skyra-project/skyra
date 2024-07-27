import type { ISchemaValue } from '#lib/database/settings/base/ISchemaValue';
import type { SchemaGroup } from '#lib/database/settings/schema/SchemaGroup';
import type { Serializer } from '#lib/database/settings/structures/Serializer';
import type { GuildDataKey, ReadonlyGuildEntity } from '#lib/database/settings/types';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { SkyraArgs } from '#lib/structures';
import type { TypedT } from '#lib/types';
import { resolveGuild } from '#utils/functions';
import { container } from '@sapphire/framework';
import type { TFunction } from '@sapphire/plugin-i18next';
import { isNullish } from '@sapphire/utilities';

export class SchemaKey<K extends GuildDataKey = GuildDataKey> implements ISchemaValue {
	/**
	 * The key that identifies this configuration key from the parent group.
	 */
	public readonly key: string;

	/**
	 * The i18n key for the configuration key.
	 */
	public readonly description: TypedT<string>;

	/**
	 * The maximum value for the configuration key.
	 */
	public readonly maximum: number | null;

	/**
	 * The minimum value for the configuration key.
	 */
	public readonly minimum: number | null;

	/**
	 * Whether or not the range checks are inclusive.
	 */
	public readonly inclusive: boolean;

	/**
	 * The visible name of the configuration key.
	 */
	public readonly name: string;

	/**
	 * The property from the TypeORM entity.
	 */
	public readonly property: K;

	/**
	 * The type of the value this property accepts.
	 */
	public readonly type: Serializer.Name;

	/**
	 * Whether or not this accepts multiple values.
	 */
	public readonly array: boolean;

	/**
	 * The default value for this key.
	 */
	public readonly default: unknown;

	/**
	 * Whether this key should only be configurable on the dashboard
	 */
	public readonly dashboardOnly: boolean;

	/**
	 * The parent group that holds this key.
	 */
	public parent: SchemaGroup | null = null;

	public constructor(options: ConfigurableKeyValueOptions) {
		this.key = options.key;
		this.description = options.description;
		this.maximum = options.maximum;
		this.minimum = options.minimum;
		this.inclusive = options.inclusive ?? false;
		this.name = options.name;
		this.property = options.property as K;
		this.type = options.type;
		this.array = options.array;
		this.default = options.default;
		this.dashboardOnly = options.dashboardOnly ?? false;
	}

	public get serializer(): Serializer<ReadonlyGuildEntity[K]> {
		const value = container.stores.get('serializers').get(this.type);
		if (typeof value === 'undefined') throw new Error(`The serializer for '${this.type}' does not exist.`);
		return value as Serializer<ReadonlyGuildEntity[K]>;
	}

	public async parse(settings: ReadonlyGuildEntity, args: SkyraArgs): Promise<ReadonlyGuildEntity[K]> {
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

	public stringify(settings: ReadonlyGuildEntity, t: TFunction, value: ReadonlyGuildEntity[K]): string {
		const { serializer } = this;
		const context = this.getContext(settings, t);
		return serializer.stringify(value, context);
	}

	public display(settings: ReadonlyGuildEntity, t: TFunction): string {
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

	public getContext(settings: ReadonlyGuildEntity, language: TFunction): Serializer.UpdateContext {
		return {
			entity: settings,
			guild: resolveGuild(settings.id),
			t: language,
			entry: this
		} satisfies Serializer.UpdateContext;
	}
}

export type ConfigurableKeyValueOptions = Pick<
	SchemaKey,
	'key' | 'description' | 'maximum' | 'minimum' | 'inclusive' | 'name' | 'property' | 'type' | 'array' | 'default' | 'dashboardOnly'
>;
