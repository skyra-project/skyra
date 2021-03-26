import type { LanguageHelpDisplayOptions } from '#lib/i18n/LanguageHelp';
import { FT, T } from '#lib/types';
import type { Pick, Tag, Transformer } from '@skyra/tags';

export const TagAdded = FT<{ name: string; content: string }, string>('commands/tags:added');
export const TagDescription = T<string>('commands/tags:description');
export const TagEdited = FT<{ name: string; content: string }, string>('commands/tags:edited');
export const TagExists = FT<{ tag: string }, string>('commands/tags:exists');
export const TagExtended = T<LanguageHelpDisplayOptions>('commands/tags:extended');
export const TagListEmpty = T<string>('commands/tags:listEmpty');
export const TagNameNotAllowed = T<string>('commands/tags:nameNotAllowed');
export const TagNameTooLong = T<string>('commands/tags:nameTooLong');
export const TagNotExists = FT<{ tag: string }, string>('commands/tags:notexists');
export const TagPermissionLevel = T<string>('commands/tags:permissionlevel');
export const TagRemoved = FT<{ name: string }, string>('commands/tags:removed');
export const TagRenamed = FT<{ name: string; previous: string }, string>('commands/tags:renamed');
export const TagReset = T<string>('commands/tags:reset');
export const ParseMismatchingNamedArgumentTypeValidation = FT<{ expected: Tag; received: Tag }, string>(
	'commands/tags:parseMismatchingNamedArgumentTypeValidation'
);
export const ParseParserEmptyStringTag = T<string>('commands/tags:parseParserEmptyStringTag');
export const ParseParserMissingToken = T<string>('commands/tags:parseParserMissingToken');
export const ParseParserPickMissingOptions = T<string>('commands/tags:parseParserPickMissingOptions');
export const ParseParserRandomDuplicatedOptions = T<string>('commands/tags:parseParserRandomDuplicatedOptions');
export const ParseParserRandomMissingOptions = T<string>('commands/tags:parseParserRandomMissingOptions');
export const ParseParserUnexpectedToken = FT<{ expected: string; received: string }, string>('commands/tags:parseParserUnexpectedToken');
export const ParsePickInvalidOption = FT<{ pick: Pick; option: string }, string>('commands/tags:parsePickInvalidOption');
export const ParseSentenceMissingArgument = T<string>('commands/tags:parseSentenceMissingArgument');
export const ParseTransformerInvalidFormatter = FT<{ transformer: Transformer; formatter: string }, string>(
	'commands/tags:parseTransformerInvalidFormatter'
);
export const ParseTokenSpace = T<string>('commands/tags:parseTokenSpace');
export const ParseTokenTagStart = T<string>('commands/tags:parseTokenTagStart');
export const ParseTokenTagEnd = T<string>('commands/tags:parseTokenTagEnd');
export const ParseTokenEquals = T<string>('commands/tags:parseTokenEquals');
export const ParseTokenColon = T<string>('commands/tags:parseTokenColon');
export const ParseTokenPipe = T<string>('commands/tags:parseTokenPipe');
export const ParseTokenLiteral = T<string>('commands/tags:parseTokenLiteral');
