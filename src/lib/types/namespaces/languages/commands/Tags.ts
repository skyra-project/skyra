import { FT, T } from '#lib/types/index';
import { LanguageHelpDisplayOptions } from '#utils/LanguageHelp';

export const TagAdded = FT<{ name: string; content: string }, string>('commandTagAdded');
export const TagContentRequired = T<string>('commandTagContentRequired');
export const TagDescription = T<string>('commandTagDescription');
export const TagEdited = FT<{ name: string; content: string }, string>('commandTagEdited');
export const TagExists = FT<{ tag: string }, string>('commandTagExists');
export const TagExtended = T<LanguageHelpDisplayOptions>('commandTagExtended');
export const TagListEmpty = T<string>('commandTagListEmpty');
export const TagNameNotAllowed = T<string>('commandTagNameNotAllowed');
export const TagNameTooLong = T<string>('commandTagNameTooLong');
export const TagNotExists = FT<{ tag: string }, string>('commandTagNotexists');
export const TagPermissionLevel = T<string>('commandTagPermissionlevel');
export const TagRemoved = FT<{ name: string }, string>('commandTagRemoved');
export const TagReset = T<string>('commandTagReset');
