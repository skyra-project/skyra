import { Query, QueryGetHoroscopeArgs } from '@skyra/saelem';
import { Mime } from './constants';
import { fetch, FetchMethods, FetchResultTypes, gql } from './util';

export const getHoroscope = gql`
	query getHoroscope($sunsign: Sunsigns!, $day: Days!) {
		getHoroscope(sunsign: $sunsign, day: $day) {
			date
			intensity
			keywords
			mood
			prediction
			rating
		}
	}
`;

export const SAELEM_GRAPHQL_API_URL = 'http://localhost:8284';

export async function fetchSaelem<R extends SaelemQueryReturnTypes>(query: string, variables: SaelemQueryVariables<R>) {
	try {
		return await fetch<SaelemResponse<R>>(
			SAELEM_GRAPHQL_API_URL,
			{
				method: FetchMethods.Post,
				headers: {
					'Content-Type': Mime.Types.ApplicationJson
				},
				body: JSON.stringify({
					query,
					variables
				})
			},
			FetchResultTypes.JSON
		);
	} catch {
		// No need to throw anything specific here, it is caught off in the commands' fetchAPI method.
		throw 'query_failed';
	}
}

export type SaelemQueryReturnTypes = keyof Pick<Query, 'getHoroscope'>;

export interface SaelemResponse<K extends keyof Omit<Query, '__typename'>> {
	data: Record<K, Omit<Query[K], '__typename'>>;
}

type SaelemQueryVariables<R extends SaelemQueryReturnTypes> = R extends 'getHoroscope' ? QueryGetHoroscopeArgs : never;
