import type { LanguageHelpDisplayOptions } from '#lib/i18n/LanguageHelp';
import { FT, T } from '#lib/types';

export const RemindMeDelete = FT<{ remainingDuration: number; id: number }, string>('commands/misc:remindmeDelete');
export const RemindMeDescription = T('commands/misc:remindmeDescription');
export const RemindMeExtended = T<LanguageHelpDisplayOptions>('commands/misc:remindmeExtended');
export const RemindMeInvalidId = T('commands/misc:remindmeInvalidId');
export const RemindMeListEmpty = T('commands/misc:remindmeListEmpty');
export const RemindMeNotFound = T('commands/misc:remindmeNotfound');
export const RemindMeShowFooter = FT<{ id: number }, string>('commands/misc:remindmeShowFooter');
export const RemindMeDeprecated = T('commands/misc:remindmeDeprecated');
export const SnipeDescription = T<string>('commands/misc:snipeDescription');
export const SnipeEmpty = T<string>('commands/misc:snipeEmpty');
export const SnipeExtended = T<LanguageHelpDisplayOptions>('commands/misc:snipeExtended');
export const SnipeTitle = T<string>('commands/misc:snipeTitle');
