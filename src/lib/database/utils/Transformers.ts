import { ensure } from '#lib/customCommands';
import { isNullish } from '@sapphire/utilities';
import { ValueTransformer } from 'typeorm';
import type { CustomCommand } from '../entities/GuildEntity';

export const kBigIntTransformer: ValueTransformer = {
	from: (value) => (isNullish(value) ? value : Number(value as string)),
	to: (value) => (isNullish(value) ? value : String(value as number))
};

export const kTagsTransformer: ValueTransformer = {
	from: (values: RawCustomCommand[]): CustomCommand[] => values.map((value) => ({ ...value, content: ensure(value.content) })),
	to: (values: CustomCommand[]): RawCustomCommand[] => values.map((value) => ({ ...value, content: value.content.toString() }))
};

interface RawCustomCommand extends Omit<CustomCommand, 'content'> {
	content: string;
}
