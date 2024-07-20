import type { GuildEntity } from '#lib/database/entities';
import type { IBaseEntity } from '#lib/database/settings/base/IBaseEntity';
import type { BaseEntity } from 'typeorm';

export type GuildData = Omit<
	GuildEntity,
	keyof BaseEntity | keyof IBaseEntity | 'id' | 'adders' | 'permissionNodes' | 'wordFilterRegExp' | 'nms' | 'guild' | 'getLanguage' | 'toJSON'
>;

export type GuildDataKey = keyof GuildData;
export type GuildDataValue = GuildData[GuildDataKey];
