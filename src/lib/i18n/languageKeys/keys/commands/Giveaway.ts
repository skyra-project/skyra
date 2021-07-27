import type { LanguageHelpDisplayOptions } from '#lib/i18n/LanguageHelp';
import { FT, T } from '#lib/types';

export const GiveawayDescription = T('commands/giveaway:giveawayDescription');
export const GiveawayExtended = T<LanguageHelpDisplayOptions>('commands/giveaway:giveawayExtended');
export const GiveawayRerollDescription = T('commands/giveaway:giveawayRerollDescription');
export const GiveawayRerollExtended = T<LanguageHelpDisplayOptions>('commands/giveaway:giveawayRerollExtended');
export const GiveawayScheduleDescription = T('commands/giveaway:giveawayScheduleDescription');
export const GiveawayScheduleExtended = T<LanguageHelpDisplayOptions>('commands/giveaway:giveawayScheduleExtended');
export const GiveawayRerollInvalid = T('commands/giveaway:giveawayRerollInvalid');
export const GiveawayEndDescription = T('commands/giveaway:giveawayEndDescription');
export const GiveawayEndExtended = T<LanguageHelpDisplayOptions>('commands/giveaway:giveawayEndExtended');
export const GiveawayEndMessageNotMine = T('commands/giveaway:giveawayEndMessageNotMine');
export const GiveawayEndMessageNotActive = T('commands/giveaway:giveawayEndMessageNotActive');
export const GiveawayEnd = FT<{ url: string }>('commands/giveaway:giveawayEnd');
