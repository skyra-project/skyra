import type { LanguageHelpDisplayOptions } from '#lib/i18n/LanguageHelp';
import { FT, T } from '#lib/types';

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
