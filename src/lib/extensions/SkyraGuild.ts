import { Collection, Structures } from 'discord.js';
import ModerationManager from '../structures/ModerationManager';
import StarboardManager from '../structures/StarboardManager';
import GuildSecurity from '../util/GuildSecurity';
const kUnknownMember: symbol = Symbol('UnknownMember');

export default Structures.extend('Guild', (Guild) => class SkyraGuild extends Guild {

	/**
	 * The GuildSecurity class in charge of processing
	 * @since 3.0.0
	 */
	public security: GuildSecurity = new GuildSecurity(this);
	/**
	 * The StarboardManager instance in charge of managing the starred messages
	 * @since 3.0.0
	 */
	public starboard: StarboardManager = new StarboardManager(this);
	/**
	 * The ModerationManager instance in charge of managing moderation
	 * @since 3.4.0
	 */
	public moderation: ModerationManager = new ModerationManager(this);

	/**
	 * The name dictionary for this guild
	 * @since 3.2.0
	 */
	@enumerable(false)
	public nameDictionary: Collection<string, string | symbol> = new Collection();

	/**
	 * Fetch an user's username by its id
	 * @since 3.2.0
	 * @param id The ID to fetch
	 */
	public async fetchName(id: string): Promise<string | null> {
		const result: string | symbol = this.nameDictionary.get(id) || await this.members.fetch(id).then(({ displayName }) => {
			this.nameDictionary.set(id, displayName);
			return displayName;
		}).catch(() => {
			this.nameDictionary.set(id, kUnknownMember);
			return kUnknownMember;
		});
		// @ts-ignore
		return result === kUnknownMember ? null : result;
	}

});
