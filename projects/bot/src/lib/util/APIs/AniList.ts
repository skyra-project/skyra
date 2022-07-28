import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { Page } from '#lib/types/definitions/AniList';
import { fetch, FetchMethods, FetchResultTypes } from '@sapphire/fetch';
import { UserError } from '@sapphire/framework';
import { MimeTypes } from '@sapphire/plugin-api';
import { cutText } from '@sapphire/utilities';
import { decode } from 'he';
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

/**
 * Regex to remove excessive new lines from the Anime or Manga description
 */
const excessiveNewLinesRegex = /\n{3,}/g;

/**
 * Regex to remove HTML entities from the Anime or Manga description
 */
const htmlEntityRegex = /<\/?(i|b|br)>/g;

/**
 * Replacements for HTML entities
 */
const htmlEntityReplacements = Object.freeze({
	i: '_',
	em: '_',
	var: '_',
	b: '**',
	br: '\n',
	code: '```',
	pre: '`',
	mark: '`',
	kbd: '`',
	s: '~~',
	wbr: '',
	u: '__'
} as const);

export const getAnime = gql`
	${MediaFragment}

	query ($search: String!) {
		Page(page: 1, perPage: 10) {
			pageInfo {
				total
			}
			media(search: $search, type: ANIME) {
				...MediaFragment
				episodes
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
				chapters
				volumes
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

export function parseDescription(description: string) {
	return cutText(
		decode(description.replace(htmlEntityRegex, (_, type: keyof typeof htmlEntityReplacements) => htmlEntityReplacements[type])).replace(
			excessiveNewLinesRegex,
			'\n\n'
		),
		500
	);
}

interface AniListResponse {
	data: {
		Page: Page;
	};
}
