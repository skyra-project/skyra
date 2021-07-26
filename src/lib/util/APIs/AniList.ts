import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { Page } from '#lib/types/definitions/AniList';
import { fetch, FetchMethods, FetchResultTypes } from '@sapphire/fetch';
import { UserError } from '@sapphire/framework';
import { MimeTypes } from '@sapphire/plugin-api';
import { gql } from '../util';

const MediaFragment = gql`
	fragment MediaFragment on Media {
		id
		title {
			romaji
			english
			native
		}
		description
		episodes
		isAdult
		countryOfOrigin
		duration
		siteUrl
		externalLinks {
			url
			site
		}
	}
`;

export const getAnime = gql`
	${MediaFragment}

	query ($search: String!) {
		Page(page: 1, perPage: 10) {
			pageInfo {
				total
			}
			media(search: $search, type: ANIME) {
				...MediaFragment
			}
		}
	}
`;

export const getManga = gql`
	${MediaFragment}

	query ($search: String!) {
		Page(page: 1, perPage: 10) {
			pageInfo {
				total
			}
			media(search: $search, type: MANGA) {
				...MediaFragment
			}
		}
	}
`;

export async function fetchAniList(
	query: string,
	variables: {
		search: string;
	}
): Promise<AniListResponse> {
	try {
		return fetch<AniListResponse>(
			'https://graphql.anilist.co/',
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
		throw new UserError({ identifier: LanguageKeys.System.QueryFail });
	}
}

interface AniListResponse {
	data: {
		Page: Page;
	};
}
