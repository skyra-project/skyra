import { FT, T } from '@lib/types/Shared';
import { LanguageHelpDisplayOptions } from '@utils/LanguageHelp';

export const StarDescription = T<string>('commandStarDescription');
export const StarExtended = T<LanguageHelpDisplayOptions>('commandStarExtended');
export const StarNostars = T<string>('commandStarNostars');
export const StarStats = T<string>('commandStarStats');
export const StarStatsDescription = FT<{ messages: string; stars: string }, string>('commandStarStatsDescription');
export const StarMessages = FT<{ count: number }, string>('commandStarMessages');
export const StarMessagesPlural = FT<{ count: number }, string>('commandStarMessagesPlural');
export const Stars = FT<{ count: number }, string>('commandStars');
export const StarsPlural = FT<{ count: number }, string>('commandStarsPlural');
export const StarTopstarred = T<string>('commandStarTopstarred');
export const StarTopstarredDescription = FT<{ medal: string; id: string; count: number }, string>('commandStarTopstarredDescription');
export const StarTopstarredDescriptionPlural = FT<{ medal: string; id: string; count: number }, string>('commandStarTopstarredDescriptionPlural');
export const StarTopreceivers = T<string>('commandStarTopreceivers');
export const StarTopreceiversDescription = FT<{ medal: string; id: string; count: number }, string>('commandStarTopreceiversDescription');
export const StarTopreceiversDescriptionPlural = FT<{ medal: string; id: string; count: number }, string>('commandStarTopreceiversDescriptionPlural');
