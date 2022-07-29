import { FT, T } from '#lib/types';

export const InvalidId = T<string>('serializers:customCommandInvalidId');
export const InvalidAliases = T<string>('serializers:customCommandInvalidAliases');
export const InvalidEmbed = T<string>('serializers:customCommandInvalidEmbed');
export const InvalidColor = T<string>('serializers:customCommandInvalidColor');
export const InvalidContent = T<string>('serializers:customCommandInvalidContent');
export const InvalidType = FT<{ possibles: readonly string[]; count: number }, string>('serializers:customCommandInvalidType');
export const MissingParameter = FT<{ type: string }, string>('serializers:customCommandMissingParameter');
