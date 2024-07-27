import type { SchemaGroup } from '#lib/database/settings/schema/SchemaGroup';
import type { ReadonlyGuildEntity } from '#lib/database/settings/types';
import type { TFunction } from '@sapphire/plugin-i18next';

export interface ISchemaValue {
	readonly type: string;
	readonly name: string;
	readonly dashboardOnly: boolean;
	readonly parent: SchemaGroup | null;
	display(settings: ReadonlyGuildEntity, language: TFunction): string;
}
