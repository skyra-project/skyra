import type { LanguageHelpDisplayOptions } from '#lib/i18n/LanguageHelp';
import { FT, T } from '#lib/types';

export const DeprecatedMessage = FT<{ command: string }>('commands/shared:deprecatedMessage');
export const SlashDetailed = T<LanguageHelpDisplayOptions>('commands/shared:slashDetailed');
