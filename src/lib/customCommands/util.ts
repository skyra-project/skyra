import { CustomCommand, CustomCommandAlias, CustomCommandContent } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { SkyraArgs } from '#lib/structures';
import type { O } from '#utils/constants';
import { Awaited } from '@sapphire/utilities';
import { Lexer, parse, Parser, Sentence, SentencePartType } from '@skyra/tags';
import { InvalidTypeError } from './errors/InvalidTypeError';
import { MissingArgumentsError } from './errors/MissingArgumentsError';
import { ParserNotRunError } from './errors/ParserNotRunError';

export const validTypes = new Set<string>(InvalidTypeError.possibles);
export const argLessTypes = new Set<string>(InvalidTypeError.argLessPossibles);

export function validate(parser: Parser) {
	if (parser.parts.length === 0) throw new ParserNotRunError(parser);

	parser.check();
	for (const part of parser.parts) {
		// If it's a literal, continue:
		if (part.type === SentencePartType.Literal) continue;

		// If it's a valid type, continue:
		if (validTypes.has(part.value.type)) continue;

		// Else it was invalid, throw in this case:
		throw new InvalidTypeError(parser, part.value);
	}
}

export function parseAndValidate(content: string) {
	const parser = new Parser(new Lexer(content));
	const parts = parser.parse();
	validate(parser);

	return new Sentence(parts);
}

export function ensure(content: string) {
	try {
		return parse(content);
	} catch {
		return new Sentence([{ type: SentencePartType.Literal, value: content }]);
	}
}

export function parseParameter(args: SkyraArgs, type: InvalidTypeError.Type): Awaited<string> {
	if (!argLessTypes.has(type) && args.finished) throw new MissingArgumentsError(args, type);

	switch (type) {
		case 'author':
			return args.message.author.toString();
		case 'author.id':
			return args.message.author.id;
		case 'author.name':
			return args.message.author.username;
		case 'channel':
			return args.pick('guildChannel').then((channel) => channel.toString());
		case 'channel.id':
			return args.pick('guildChannel').then((channel) => channel.id);
		case 'channel.name':
			return args.pick('guildChannel').then((channel) => channel.name);
		case 'emoji':
			return args.pick('emoji');
		case 'server.id':
		case 'guild.id':
			return args.message.guild!.id;
		case 'server':
		case 'server.name':
		case 'guild':
		case 'guild.name':
			return args.message.guild!.name;
		case 'server.acronym':
		case 'guild.acronym':
			return args.message.guild!.nameAcronym;
		case 'rest':
			return args.rest('string');
		case 'pick':
			return args.pick('string');
		case 'random':
			return '';
		case 'role':
			return args.pick('role').then((role) => role.toString());
		case 'role.color':
			return args.pick('role').then((role) => role.hexColor);
		case 'role.hoist':
			return args.pick('role').then((role) => (role.hoist ? args.t(LanguageKeys.Globals.Yes) : args.t(LanguageKeys.Globals.No)));
		case 'role.id':
			return args.pick('role').then((role) => role.id);
		case 'role.name':
			return args.pick('role').then((role) => role.name);
		case 'role.position':
			return args.pick('role').then((role) => args.t(LanguageKeys.Globals.NumberValue, { value: role.position }));
		case 'member':
		case 'user':
			return args.pick('member').then((member) => member.toString());
		case 'member.displayName':
		case 'user.displayName':
			return args.pick('member').then((member) => member.displayName);
		case 'member.name':
		case 'user.name':
			return args.pick('member').then((member) => member.user.username);
		case 'member.id':
		case 'user.id':
			return args.pick('member').then((member) => member.id);
		case 'word':
			return args.pick('string');
	}
}

export function isAlias(command: CustomCommandAlias | O): command is CustomCommandAlias {
	return Reflect.has(command, 'alias');
}

export function isContent(command: CustomCommandContent | O): command is CustomCommandContent {
	return !Reflect.has(command, 'alias');
}

export function getFromName(name: string, tags: CustomCommand[]): CustomCommandContent | null {
	for (const tag of tags) {
		if (tag.id !== name) continue;
		if (isContent(tag)) return tag;

		// It matched an alias, break the loop:
		break;
	}

	// No tag matched, return null:
	return null;
}

export function getFromPossibleAlias(name: string, tags: CustomCommand[]): CustomCommandContent | null {
	for (const tag of tags) {
		if (tag.id !== name) continue;
		if (isContent(tag)) return tag;

		return getFromName(tag.alias, tags);
	}

	// No tag matched, skip and return null:
	return null;
}

export function renameAliases(previous: string, next: string, tags: CustomCommand[]) {
	for (const tag of tags) {
		if (isAlias(tag) && tag.alias === previous) tag.alias = next;
	}
}

export function removeAliases(id: string, tags: CustomCommand[]) {
	let i = 0;
	while (i < tags.length) {
		const tag = tags[i];
		if (isAlias(tag) && tag.alias === id) tags.splice(i, 1);
		else ++i;
	}
}
