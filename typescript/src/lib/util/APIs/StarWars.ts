import { envParseString } from '#lib/env';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { fetch, FetchMethods, FetchResultTypes } from '@sapphire/fetch';
import { UserError } from '@sapphire/framework';
import { MimeTypes } from '@sapphire/plugin-api';
import type {
	Query,
	QueryGetFuzzyFilmArgs,
	QueryGetFuzzyPersonArgs,
	QueryGetFuzzyPlanetArgs,
	QueryGetFuzzySpeciesArgs,
	QueryGetFuzzyStarshipArgs,
	QueryGetFuzzyVehicleArgs
} from '@skyra/star-wars-api';
import { gql } from '../util';

export const getFilms = gql`
	query ($film: String!, $take: Int, $reverse: Boolean) {
		getFuzzyFilm(film: $film, take: $take, reverse: $reverse) {
			director
			episodeId
			releaseDate
			openingCrawl
			producers
			title
			characters {
				name
			}
			planets {
				name
			}
			species {
				name
			}
			starships {
				name
			}
			vehicles {
				name
			}
		}
	}
`;

export const getPerson = gql`
	query ($person: String!, $take: Int, $reverse: Boolean) {
		getFuzzyPerson(person: $person, take: $take, reverse: $reverse) {
			birthYear
			eyeColors
			films {
				title
			}
			gender
			hairColors
			height
			homeworld {
				name
			}
			mass
			name
			skinColors
			species {
				name
			}
			starships {
				name
			}
			vehicles {
				name
			}
		}
	}
`;

export const getPlanet = gql`
	query ($planet: String!, $take: Int, $reverse: Boolean) {
		getFuzzyPlanet(planet: $planet, take: $take, reverse: $reverse) {
			climates
			diameter
			films {
				title
			}
			gravity
			name
			orbitalPeriod
			population
			residents {
				name
			}
			rotationPeriod
			surfaceWater
			terrains
		}
	}
`;

export const getSpecies = gql`
	query ($species: String!, $take: Int, $reverse: Boolean) {
		getFuzzySpecies(species: $species, take: $take, reverse: $reverse) {
			averageHeight
			averageLifespan
			classification
			designation
			eyeColors
			films {
				title
			}
			hairColors
			homeworld {
				name
			}
			language
			name
			people {
				name
			}
			skinColors
		}
	}
`;

export const getStarship = gql`
	query ($starship: String!, $take: Int, $reverse: Boolean) {
		getFuzzyStarship(starship: $starship, take: $take, reverse: $reverse) {
			cargoCapacity
			consumables
			costInCredits
			crew
			films {
				title
			}
			hyperdriveRating
			length
			manufacturers
			maxAtmospheringSpeed
			MGLT
			model
			name
			passengers
			pilots {
				name
			}
			starshipClass
		}
	}
`;

export const getVehicle = gql`
	query ($vehicle: String!, $take: Int, $reverse: Boolean) {
		getFuzzyVehicle(vehicle: $vehicle, take: $take, reverse: $reverse) {
			cargoCapacity
			consumables
			costInCredits
			crew
			films {
				title
			}
			length
			manufacturers
			maxAtmospheringSpeed
			model
			name
			passengers
			pilots {
				name
			}
			vehicleClass
		}
	}
`;

export async function fetchStarWarsApi<R extends StarWarsQueryReturnTypes>(
	query: string,
	variables: StarWarsQueryVariables<R>
): Promise<StarWarsResponse<R>> {
	try {
		return fetch<StarWarsResponse<R>>(
			envParseString('GRAPHQL_STARWARS_URL'),
			{
				method: FetchMethods.Post,
				headers: {
					'Content-Type': MimeTypes.ApplicationJson
				},
				body: JSON.stringify({
					query,
					variables
				})
			},
			FetchResultTypes.JSON
		);
	} catch (error) {
		throw new UserError({ identifier: LanguageKeys.System.QueryFail });
	}
}

export interface StarWarsResponse<K extends keyof Omit<Query, '__typename'>> {
	data: Record<K, Omit<Query[K], '__typename'>>;
}

export type StarWarsQueryReturnTypes = keyof Pick<
	Query,
	'getFuzzyFilm' | 'getFuzzyPerson' | 'getFuzzyPlanet' | 'getFuzzySpecies' | 'getFuzzyStarship' | 'getFuzzyVehicle'
>;

type StarWarsQueryVariables<R extends StarWarsQueryReturnTypes> = R extends 'getFuzzyFilm'
	? QueryGetFuzzyFilmArgs
	: R extends 'getFuzzyPlanet'
	? QueryGetFuzzyPlanetArgs
	: R extends 'getFuzzyPerson'
	? QueryGetFuzzyPersonArgs
	: R extends 'getFuzzySpecies'
	? QueryGetFuzzySpeciesArgs
	: R extends 'getFuzzyStarship'
	? QueryGetFuzzyStarshipArgs
	: R extends 'getFuzzyVehicle'
	? QueryGetFuzzyVehicleArgs
	: never;
