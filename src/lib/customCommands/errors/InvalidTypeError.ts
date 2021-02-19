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

	public static readonly possibles = [
		'author.id',
		'author.name',
		'author',
		'channel.id',
		'channel.name',
		'channel',
		'emoji',
		'guild.acronym',
		'guild.id',
		'guild.name',
		'guild',
		'member.displayName',
		'member.id',
		'member.name',
		'member',
		'pick',
		'random',
		'rest',
		'role.color',
		'role.hoist',
		'role.id',
		'role.name',
		'role.position',
		'role',
		'server.acronym',
		'server.id',
		'server.name',
		'server',
		'user.displayName',
		'user.id',
		'user.name',
		'user',
		'word'
	] as const;
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace InvalidTypeError {
	export type Type =
		| 'author.id'
		| 'author.name'
		| 'author'
		| 'channel.id'
		| 'channel.name'
		| 'channel'
		| 'emoji'
		| 'guild.acronym'
		| 'guild.id'
		| 'guild.name'
		| 'guild'
		| 'member.displayName'
		| 'member.id'
		| 'member.name'
		| 'member'
		| 'pick'
		| 'random'
		| 'rest'
		| 'role.color'
		| 'role.hoist'
		| 'role.id'
		| 'role.name'
		| 'role.position'
		| 'role'
		| 'server.acronym'
		| 'server.id'
		| 'server.name'
		| 'server'
		| 'user.displayName'
		| 'user.id'
		| 'user.name'
		| 'user'
		| 'word';
}
