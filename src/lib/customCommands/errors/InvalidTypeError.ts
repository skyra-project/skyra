import { LanguageKeys } from '#lib/i18n/languageKeys';
import { UserError } from '@sapphire/framework';
import type { Parser, Tag } from '@skyra/tags';

export class InvalidTypeError extends UserError {
	public readonly parser: Parser;
	public readonly tag: Tag;

	public constructor(parser: Parser, tag: Tag) {
		super({
			identifier: LanguageKeys.Serializers.CustomCommands.InvalidType,
			context: {
				parser,
				tag,
				possibles: InvalidTypeError.possibles.map((possible) => `\`${possible}\``),
				count: InvalidTypeError.possibles.length
			}
		});
		this.parser = parser;
		this.tag = tag;
	}

	public static readonly argLessPossibles = [
		'author.id',
		'author.name',
		'author',
		'guild.acronym',
		'guild.id',
		'guild.name',
		'guild',
		'random',
		'server.acronym',
		'server.id',
		'server.name',
		'server'
	] as const;

	public static readonly possibles = [
		...InvalidTypeError.argLessPossibles,
		'channel.id',
		'channel.name',
		'channel',
		'emoji',
		'member.displayName',
		'member.id',
		'member.name',
		'member',
		'pick',
		'rest',
		'role.color',
		'role.hoist',
		'role.id',
		'role.name',
		'role.position',
		'role',
		'user.displayName',
		'user.id',
		'user.name',
		'user',
		'word'
	] as const;
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace InvalidTypeError {
	export type ArgLessType =
		| 'author.id'
		| 'author.name'
		| 'author'
		| 'guild.acronym'
		| 'guild.id'
		| 'guild.name'
		| 'guild'
		| 'random'
		| 'server.acronym'
		| 'server.id'
		| 'server.name'
		| 'server';

	export type Type =
		| ArgLessType
		| 'channel.id'
		| 'channel.name'
		| 'channel'
		| 'emoji'
		| 'member.displayName'
		| 'member.id'
		| 'member.name'
		| 'member'
		| 'pick'
		| 'rest'
		| 'role.color'
		| 'role.hoist'
		| 'role.id'
		| 'role.name'
		| 'role.position'
		| 'role'
		| 'user.displayName'
		| 'user.id'
		| 'user.name'
		| 'user'
		| 'word';
}
