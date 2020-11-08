import type { GuildEntity, SchemaGroup } from '@lib/database';
import type { Language } from 'klasa';

export interface ISchemaValue {
	readonly type: string;
	readonly name: string;
	readonly parent: SchemaGroup | null;
	display(settings: GuildEntity, language: Language): string;
}
