import type { LanguageHelpDisplayOptions } from '#lib/i18n/LanguageHelp';
import { FT, T } from '#lib/types';

export const EscapeRopeDescription = T<string>('commands/fun:escaperopeDescription');
export const EscapeRopeExtended = T<LanguageHelpDisplayOptions>('commands/fun:escaperopeExtended');
export const EscapeRopeOutput = FT<{ user: string }, string>('commands/fun:escaperopeOutput');
