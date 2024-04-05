import type { LanguageHelpDisplayOptions } from '#lib/i18n/LanguageHelp';
import { FT, T } from '#lib/types';

export const DeprecatedMessage = FT<{ command: string }>('commands/shared:deprecatedMessage');
export const SlashOnlyDetailedDescription = T<LanguageHelpDisplayOptions>('commands/shared:slashOnlyDetailedDescription');
export const SlashOnlyErrorMessage = T('commands/shared:slashOnlyErrorMessage');
