import type { GuildEntity } from '#lib/database/entities/GuildEntity';
import type { SchemaGroup } from '#lib/database/settings/schema/SchemaGroup';
import type { TFunction } from '@sapphire/plugin-i18next';

export interface ISchemaValue {
	readonly type: string;
	readonly name: string;
	readonly dashboardOnly: boolean;
	readonly parent: SchemaGroup | null;
	display(settings: GuildEntity, language: TFunction): string;
}
