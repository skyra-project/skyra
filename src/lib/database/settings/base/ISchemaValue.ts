import type { GuildEntity } from '@lib/database/entities/GuildEntity';
import type { SchemaGroup } from '@lib/database/settings/schema/SchemaGroup';
import type { Language } from 'klasa';

export interface ISchemaValue {
	readonly type: string;
	readonly name: string;
	readonly parent: SchemaGroup | null;
	display(settings: GuildEntity, language: Language): string;
}
