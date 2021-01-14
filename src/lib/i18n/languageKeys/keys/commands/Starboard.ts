import { LanguageHelpDisplayOptions } from '#lib/i18n/LanguageHelp';
import { FT, T } from '#lib/types';

export const StarDescription = T<string>('commands/starboard:starDescription');
export const StarExtended = T<LanguageHelpDisplayOptions>('commands/starboard:starExtended');
export const StarMessages = FT<{ count: number }, string>('commands/starboard:starMessages');
export const StarNoChannel = T<string>('commands/starboard:starNoChannel');
export const StarNoStars = T<string>('commands/starboard:starNostars');
export const Stars = FT<{ count: number }, string>('commands/starboard:stars');
export const StarStats = T<string>('commands/starboard:starStats');
export const StarStatsDescription = FT<{ messages: string; stars: string }, string>('commands/starboard:starStatsDescription');
export const StarTopReceivers = T<string>('commands/starboard:starTopreceivers');
export const StarTopReceiversDescription = FT<{ medal: string; id: string; count: number }, string>('commands/starboard:starTopreceiversDescription');
export const StarTopStarred = T<string>('commands/starboard:starTopstarred');
export const StarTopStarredDescription = FT<{ medal: string; id: string; count: number }, string>('commands/starboard:starTopstarredDescription');
