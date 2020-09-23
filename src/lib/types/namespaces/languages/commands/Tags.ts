import { T } from '@lib/types/Shared';
import { LanguageHelpDisplayOptions } from '@utils/LanguageHelp';

export const TagAdded = T<(params: { name: string; content: string }) => string>('commandTagAdded');
export const TagContentRequired = T<string>('commandTagContentRequired');
export const TagDescription = T<string>('commandTagDescription');
export const TagEdited = T<(params: { name: string; content: string }) => string>('commandTagEdited');
export const TagExists = T<(params: { tag: string }) => string>('commandTagExists');
export const TagExtended = T<LanguageHelpDisplayOptions>('commandTagExtended');
export const TagListEmpty = T<string>('commandTagListEmpty');
export const TagNameNotAllowed = T<string>('commandTagNameNotAllowed');
export const TagNameTooLong = T<string>('commandTagNameTooLong');
export const TagNotexists = T<(params: { tag: string }) => string>('commandTagNotexists');
export const TagPermissionlevel = T<string>('commandTagPermissionlevel');
export const TagRemoved = T<(params: { name: string }) => string>('commandTagRemoved');
export const TagReset = T<string>('commandTagReset');
