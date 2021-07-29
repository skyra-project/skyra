import type { LanguageHelpDisplayOptions } from '#lib/i18n/LanguageHelp';
import { EmbedTitles, FT, Resource, T } from '#lib/types';

export const FilmDescription = T('commands/starwars:filmDescription');
export const FilmExtended = T<LanguageHelpDisplayOptions>('commands/starwars:filmExtended');
export const FilmQueryFail = FT<{ film: string }, string>('commands/starwars:filmQueryFail');
export const FilmEmbedTitles = T<EmbedTitles[Resource.Films]>('commands/starwars:filmEmbedTitles');

export const PersonDescription = T('commands/starwars:personDescription');
export const PersonExtended = T<LanguageHelpDisplayOptions>('commands/starwars:personExtended');
export const PersonQueryFail = FT<{ person: string }, string>('commands/starwars:personQueryFail');
export const PersonEmbedTitles = T<EmbedTitles[Resource.People]>('commands/starwars:personEmbedTitles');

export const PlanetDescription = T('commands/starwars:planetDescription');
export const PlanetExtended = T<LanguageHelpDisplayOptions>('commands/starwars:planetExtended');
export const PlanetQueryFail = FT<{ planets: string }, string>('commands/starwars:planetQueryFail');
export const PlanetEmbedTitles = T<EmbedTitles[Resource.Planets]>('commands/starwars:planetEmbedTitles');

export const SpeciesDescription = T('commands/starwars:speciesDescription');
export const SpeciesExtended = T<LanguageHelpDisplayOptions>('commands/starwars:speciesExtended');
export const SpeciesQueryFail = FT<{ species: string }, string>('commands/starwars:speciesQueryFail');
export const SpeciesEmbedTitles = T<EmbedTitles[Resource.Species]>('commands/starwars:speciesEmbedTitles');

export const StarshipDescription = T('commands/starwars:starshipsDescription');
export const StarshipExtended = T<LanguageHelpDisplayOptions>('commands/starwars:starshipsExtended');
export const StarshipQueryFail = FT<{ starship: string }, string>('commands/starwars:starshipsQueryFail');
export const StarshipEmbedTitles = T<EmbedTitles[Resource.Starships]>('commands/starwars:starshipEmbedTitles');

export const VehicleDescription = T('commands/starwars:vehicleDescription');
export const VehicleExtended = T<LanguageHelpDisplayOptions>('commands/starwars:vehicleExtended');
export const VehicleQueryFail = FT<{ vehicle: string }, string>('commands/starwars:vehicleQueryFail');
export const VehicleEmbedTitles = T<EmbedTitles[Resource.Vehicles]>('commands/starwars:vehicleEmbedTitles');
