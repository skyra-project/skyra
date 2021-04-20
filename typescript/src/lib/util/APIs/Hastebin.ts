import { envParseString } from '#lib/env';
import { fetch, FetchMethods, FetchResultTypes } from '#utils/util';

interface HastebinResponse {
	key: string;
}

const hastebinBaseUrlPost = envParseString('HASTEBIN_POST_URL');
const hastebinBaseUrlGet = envParseString('HASTEBIN_GET_URL');

export async function getHaste(result: string, language = 'js') {
	const { key } = await fetch<HastebinResponse>(
		`${hastebinBaseUrlPost}/documents`,
		{
			method: FetchMethods.Post,
			body: result
		},
		FetchResultTypes.JSON
	);
	return `${hastebinBaseUrlGet}/${key}.${language}`;
}
