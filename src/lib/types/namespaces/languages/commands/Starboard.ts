import { FT, T } from '#lib/types';
import { LanguageHelpDisplayOptions } from '#utils/LanguageHelp';

export const StarDescription = T<string>('commands/starboard:starDescription');
export const StarExtended = T<LanguageHelpDisplayOptions>('commands/starboard:starExtended');
export const StarMessages = FT<{ count: number }, string>('commands/starboard:starMessages');
export const StarMessagesPlural = FT<{ count: number }, string>('commands/starboard:starMessagesPlural');
export const StarNoChannel = T<string>('commands/starboard:starNoChannel');
export const StarNoStars = T<string>('commands/starboard:starNostars');
export const Stars = FT<{ count: number }, string>('commands/starboard:stars');
export const StarsPlural = FT<{ count: number }, string>('commands/starboard:starsPlural');
export const StarStats = T<string>('commands/starboard:starStats');
export const StarStatsDescription = FT<{ messages: string; stars: string }, string>('commands/starboard:starStatsDescription');
export const StarTopreceivers = T<string>('commands/starboard:starTopreceivers');
export const StarTopreceiversDescription = FT<{ medal: string; id: string; count: number }, string>('commands/starboard:starTopreceiversDescription');
export const StarTopreceiversDescriptionPlural = FT<{ medal: string; id: string; count: number }, string>(
	'commands/starboard:starTopreceiversDescriptionPlural'
);
export const StarTopstarred = T<string>('commands/starboard:starTopstarred');
export const StarTopstarredDescription = FT<{ medal: string; id: string; count: number }, string>('commands/starboard:starTopstarredDescription');
export const StarTopstarredDescriptionPlural = FT<{ medal: string; id: string; count: number }, string>(
	'commands/starboard:starTopstarredDescriptionPlural'
);
