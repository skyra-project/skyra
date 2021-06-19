import { envParseString } from '#lib/env';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { fetch, FetchMethods, FetchResultTypes } from '@sapphire/fetch';
import { UserError } from '@sapphire/framework';
import { MimeTypes } from '@sapphire/plugin-api';
import type { Query, QueryGetHoroscopeArgs } from '@skyra/saelem';
import { gql } from '../util';

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

export async function fetchSaelem<R extends SaelemQueryReturnTypes>(query: string, variables: SaelemQueryVariables<R>) {
	try {
		return await fetch<SaelemResponse<R>>(
			envParseString('SAELEM_URL'),
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
	} catch {
		// No need to throw anything specific here, it is caught off in the commands' fetchAPI method.
		throw new UserError({ identifier: LanguageKeys.System.QueryFail });
	}
}

export type SaelemQueryReturnTypes = keyof Pick<Query, 'getHoroscope'>;

export interface SaelemResponse<K extends keyof Omit<Query, '__typename'>> {
	data: Record<K, Omit<Query[K], '__typename'>>;
}

type SaelemQueryVariables<R extends SaelemQueryReturnTypes> = R extends 'getHoroscope' ? QueryGetHoroscopeArgs : never;
