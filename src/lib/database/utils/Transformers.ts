import { isNullish } from '@sapphire/utilities';
import { parse } from '@skyra/tags';
import { ValueTransformer } from 'typeorm';
import type { CustomCommand } from '../entities/GuildEntity';

export const kBigIntTransformer: ValueTransformer = {
	from: (value) => (isNullish(value) ? value : Number(value as string)),
	to: (value) => (isNullish(value) ? value : String(value as number))
};

export const kTagsTransformer: ValueTransformer = {
	from: (values: RawCustomCommand[]): CustomCommand[] =>
		values.map((value) => ({ id: value.id, embed: value.embed, color: value.color, content: parse(value.content) })),
	to: (values: CustomCommand[]): RawCustomCommand[] =>
		values.map((value) => ({ id: value.id, embed: value.embed, color: value.color, content: value.content.toString() }))
};

interface RawCustomCommand {
	id: string;
	embed: boolean;
	color: number;
	content: string;
}
