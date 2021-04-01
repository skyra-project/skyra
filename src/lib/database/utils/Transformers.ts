import { ensure, isAlias } from '#lib/customCommands';
import { isNullish } from '@sapphire/utilities';
import { ValueTransformer } from 'typeorm';
import type { CustomCommand, CustomCommandAlias, CustomCommandContent } from '../entities/GuildEntity';

export const kBigIntTransformer: ValueTransformer = {
	from: (value) => (isNullish(value) ? value : Number(value as string)),
	to: (value) => (isNullish(value) ? value : String(value as number))
};

export const kTagsTransformer: ValueTransformer = {
	from: (values: RawCustomCommand[]): CustomCommand[] =>
		values.map((value) => (isAlias(value) ? value : { ...value, content: ensure(value.content) })),
	to: (values: CustomCommand[]): RawCustomCommand[] =>
		values.map((value) => (isAlias(value) ? value : { ...value, content: value.content.toString() }))
};

type RawCustomCommand = RawCustomCommandAlias | RawCustomCommandContent;
type RawCustomCommandAlias = CustomCommandAlias;
type RawCustomCommandContent = Omit<CustomCommandContent, 'content'> & { content: string };
