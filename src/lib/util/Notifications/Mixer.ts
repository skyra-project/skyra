import { TOKENS } from '../../../../config';
import { fetch, enumerable, FetchResultTypes } from '../util';
import { RequestInit } from 'node-fetch';
import { Mime } from '../constants';
import { mergeDefault } from '@klasa/utils';
import { MixerExpandedChannel, MixerUserWithChannel } from '../../types/definitions/Mixer';

export const enum ApiVersion {
	v1,
	v2
}

export class Mixer {

	public readonly BASE_URL_V1 = 'https://mixer.com/api/v1/';
	public readonly BASE_URL_V2 = 'https://mixer.com/api/v2/';

	@enumerable(false)
	private readonly $clientID = TOKENS.MIXER.CLIENT_ID;

	@enumerable(false)
	private readonly kFetchOptions = {
		headers: {
			Accept: Mime.Types.ApplicationJson
		}
	} as const;

	public async fetchChannelByID(id: string) {
		return this._performApiGETRequest(`channels/${id}`) as Promise<MixerExpandedChannel>;
	}

	public async findUsersWithChannel(query: string) {
		return this._performApiGETRequest(`users/search?query=${query}`) as Promise<MixerUserWithChannel[]>;
	}

	private async _performApiGETRequest<T>(path: string, options: RequestInit = {}, api: ApiVersion = ApiVersion.v1): Promise<T> {
		const result = await fetch(
			`${api === ApiVersion.v1 ? this.BASE_URL_V1 : this.BASE_URL_V2}${path}`,
			mergeDefault(this.kFetchOptions as RequestInit, options),
			FetchResultTypes.JSON
		) as unknown as T;
		return result;
	}

}
