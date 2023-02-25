import type { LanguageHelpDisplayOptions } from '#lib/i18n/LanguageHelp';
import { FT, T } from '#lib/types';

export const TagDescription = T<string>('commands/tags:description');
export const TagExtended = T<LanguageHelpDisplayOptions>('commands/tags:extended');
export const TagListEmpty = T<string>('commands/tags:listEmpty');
export const TagNameNotAllowed = T<string>('commands/tags:nameNotAllowed');
export const TagNameTooLong = T<string>('commands/tags:nameTooLong');
export const TagNotExists = FT<{ tag: string }, string>('commands/tags:notExists');
export const TagPermissionLevel = T<string>('commands/tags:permissionlevel');
export const TagRemoved = FT<{ name: string }, string>('commands/tags:removed');
export const TagReset = T<string>('commands/tags:reset');
export const Deprecated = T<string>('commands/tags:deprecated');
