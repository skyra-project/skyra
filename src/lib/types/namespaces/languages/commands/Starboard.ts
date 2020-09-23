import { T } from '@lib/types/Shared';
import { LanguageHelpDisplayOptions } from '@utils/LanguageHelp';

export const StarDescription = T<string>('commandStarDescription');
export const StarExtended = T<LanguageHelpDisplayOptions>('commandStarExtended');
export const StarNostars = T<string>('commandStarNostars');
export const StarStats = T<string>('commandStarStats');
export const StarStatsDescription = T<(params: { messages: string; stars: string }) => string>('commandStarStatsDescription');
export const StarMessages = T<(params: { count: number }) => string>('commandStarMessages');
export const StarMessagesPlural = T<(params: { count: number }) => string>('commandStarMessagesPlural');
export const Stars = T<(params: { count: number }) => string>('commandStars');
export const StarsPlural = T<(params: { count: number }) => string>('commandStarsPlural');
export const StarTopstarred = T<string>('commandStarTopstarred');
export const StarTopstarredDescription = T<(params: { medal: string; id: string; count: number }) => string>('commandStarTopstarredDescription');
export const StarTopstarredDescriptionPlural = T<(params: { medal: string; id: string; count: number }) => string>(
	'commandStarTopstarredDescriptionPlural'
);
export const StarTopreceivers = T<string>('commandStarTopreceivers');
export const StarTopreceiversDescription = T<(params: { medal: string; id: string; count: number }) => string>('commandStarTopreceiversDescription');
export const StarTopreceiversDescriptionPlural = T<(params: { medal: string; id: string; count: number }) => string>(
	'commandStarTopreceiversDescriptionPlural'
);
