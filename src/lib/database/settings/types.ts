import type { GuildEntity } from '#lib/database/entities';
import type { IBaseEntity } from '#lib/database/settings/base/IBaseEntity';
import type { DeepReadonly } from '@sapphire/utilities';
import type { BaseEntity } from 'typeorm';

export type GuildData = Omit<
	GuildEntity,
	keyof BaseEntity | keyof IBaseEntity | 'id' | 'adders' | 'permissionNodes' | 'wordFilterRegExp' | 'nms' | 'guild' | 'getLanguage' | 'toJSON'
>;

export type GuildDataKey = keyof GuildData;
export type GuildDataValue = GuildData[GuildDataKey];

type ReadonlyGuildEntityExcludeKeys =
	| keyof BaseEntity
	| keyof IBaseEntity
	| 'adders'
	| 'permissionNodes'
	| 'wordFilterRegExp'
	| 'nms'
	| 'guild'
	| 'toJSON';

export type ReadonlyGuildEntity = DeepReadonly<Omit<GuildEntity, ReadonlyGuildEntityExcludeKeys>> & Pick<GuildEntity, ReadonlyGuildEntityExcludeKeys>;
export type ReadonlyGuildData = DeepReadonly<GuildData>;
export type ReadonlyGuildDataValue = DeepReadonly<GuildDataValue>;
