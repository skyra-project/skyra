import type { LanguageHelpDisplayOptions } from '#lib/i18n/LanguageHelp';
import { T, FT, EmbedTitles, Resource } from '#lib/types';

export const FilmDescription = T('commands/starwars:filmDescription');
export const FilmExtended = T<LanguageHelpDisplayOptions>('commands/starwars:filmExtended');
export const FilmQueryFail = FT<{ film: string }, string>('commands/starwars:filmQueryFail');
export const FilmEmbedTitles = T<EmbedTitles[Resource.Films]>('commands/starwars:filmEmbedTitles');

export const PeopleDescription = T('commands/starwars:peopleDescription');
export const PeopleExtended = T<LanguageHelpDisplayOptions>('commands/starwars:peopleExtended');
export const PeopleQueryFail = FT<{ person: string }, string>('commands/starwars:peopleQueryFail');
export const PeopleEmbedTitles = T<EmbedTitles[Resource.People]>('commands/starwars:peopleEmbedTitles');

export const PlanetsDescription = T('commands/starwars:planetsDescription');
export const PlanetsExtended = T<LanguageHelpDisplayOptions>('commands/starwars:planetsExtended');
export const PlanetsQueryFail = FT<{ planets: string }, string>('commands/starwars:planetsQueryFail');
export const PlanetsEmbedTitles = T<EmbedTitles[Resource.Planets]>('commands/starwars:planetsEmbedTitles');

export const SpeciesDescription = T('commands/starwars:speciesDescription');
export const SpeciesExtended = T<LanguageHelpDisplayOptions>('commands/starwars:speciesExtended');
export const SpeciesQueryFail = FT<{ species: string }, string>('commands/starwars:speciesQueryFail');
export const SpeciesEmbedTitles = T<EmbedTitles[Resource.Species]>('commands/starwars:speciesEmbedTitles');

export const StarshipsDescription = T('commands/starwars:starshipsDescription');
export const StarshipsExtended = T<LanguageHelpDisplayOptions>('commands/starwars:starshipsExtended');
export const StarshipsQueryFail = FT<{ starship: string }, string>('commands/starwars:starshipsQueryFail');
export const StarshipsEmbedTitles = T<EmbedTitles[Resource.Starships]>('commands/starwars:starshipsEmbedTitles');

export const VehiclesDescription = T('commands/starwars:vehiclesDescription');
export const VehiclesExtended = T<LanguageHelpDisplayOptions>('commands/starwars:vehiclesExtended');
export const VehiclesQueryFail = FT<{ vehicle: string }, string>('commands/starwars:vehiclesQueryFail');
export const VehiclesEmbedTitles = T<EmbedTitles[Resource.Vehicles]>('commands/starwars:vehiclesEmbedTitles');
