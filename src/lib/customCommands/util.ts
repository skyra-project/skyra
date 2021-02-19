import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { SkyraArgs } from '#lib/structures';
import { Awaited } from '@sapphire/utilities';
import { Lexer, parse, Parser, Sentence, SentencePartType } from '@skyra/tags';
import { InvalidTypeError } from './errors/InvalidTypeError';
import { MissingArgumentsError } from './errors/MissingArgumentsError';
import { ParserNotRunError } from './errors/ParserNotRunError';

export const validTypes = new Set<string>(InvalidTypeError.possibles);

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
	if (type === 'random') return '';
	if (args.finished) throw new MissingArgumentsError(args, type);

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
