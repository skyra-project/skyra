import { Client } from 'klasa';
import { GameContent } from './util/OverwatchAPIResponse';

export class OverwatchProfile {

	/**
	 * @since 3.0.0
	 * @param client The client that initialized this instance
	 * @param name The battletag
	 */
	public constructor(client: Client, name: string);

	/**
	 * @since 3.0.0
	 * The Client that initialized this instance
	 */
	public readonly client: Client;

	/**
	 * @since 3.0.0
	 * The battletag
	 */
	public readonly name: string;

	/**
	 * @since 3.0.0
	 * A Map with the ProfileRAW instances
	 */
	public profiles: Map<string, ProfileRAW>;

	/**
	 * @since 3.0.0
	 * The fetched profile
	 */
	public profile?: {
		time: number;
		battletag: string;
		platform: 'pc' | 'xbl' | 'psn';
	} & GameContent;

	/**
	 * @since 3.0.0
	 * The encoded name
	 */
	public readonly encodedName: string;

	/**
	 * @since 3.0.0
	 * The best profile
	 */
	public readonly bestProfile?: ProfileRAW;

	/**
	 * @since 3.0.0
	 * @param platform The platform to get the career profile from
	 * The career profile URL
	 */
	public profileURL(platform: 'pc' | 'xbl' | 'psn'): string;

	/**
	 * @since 3.0.0
	 * Fetch all profiles
	 */
	public fetchProfiles(): Promise<this>;

	/**
	 * @since 3.0.0
	 * Fetch a profile
	 */
	public fetchProfile(): Promise<this>;

	/**
	 * @since 3.0.0
	 * @param profiles The profiles to set in the cache
	 * Set the profiles to the cache
	 */
	public setProfiles(profiles: ProfileRAW[]): this;

}

export type ProfileRAW = {
	platform: 'pc' | 'xbl' | 'psn';
	careerLink: string;
	platformDisplayName: string;
	level: number;
	portrait: string;
};
