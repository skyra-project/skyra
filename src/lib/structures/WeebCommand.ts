import { LanguageKeysComplex, LanguageKeysSimple } from '@lib/types/Augments';
import { LanguageKeys } from '@lib/types/Languages';
import { TOKENS, VERSION } from '@root/config';
import { fetch, FetchResultTypes } from '@utils/util';
import { MessageEmbed, TextChannel, User } from 'discord.js';
import { CommandOptions, CommandStore, KlasaMessage, util } from 'klasa';
import { DbSet } from './DbSet';
import { SkyraCommand } from './SkyraCommand';

export abstract class WeebCommand extends SkyraCommand {

	/**
	 * The type for this command.
	 */
	public queryType: string;
	/**
	 * The response name for Language#get
	 */
	public responseName: keyof LanguageKeys;

	protected constructor(store: CommandStore, file: string[], directory: string, options: WeebCommandOptions) {
		super(store, file, directory, util.mergeDefault({
			bucket: 2,
			cooldown: 30,
			requiredPermissions: ['EMBED_LINKS'],
			runIn: ['text']
		}, options));

		this.queryType = options.queryType;
		this.responseName = options.responseName;
	}

	public async run(message: KlasaMessage, params?: User[]) {
		const query = new URL('https://api-v2.weeb.sh/images/random');
		query.searchParams.append('type', this.queryType);
		query.searchParams.append('nsfw', String((message.channel as TextChannel).nsfw));

		const { url } = await fetch<WeebCommandResult>(query, {
			headers: {
				'Authorization': `Wolke ${TOKENS.WEEB_SH_KEY}`,
				'User-Agent': `Skyra/${VERSION}`
			}
		}, FetchResultTypes.JSON);

		return message.sendMessage(Boolean(this.usage.parsedUsage.length)
			? message.language.tget(this.responseName as LanguageKeysComplex, params![0].username)
			: message.language.tget(this.responseName as LanguageKeysSimple),
		{
			embed: new MessageEmbed()
				.setTitle('→').setURL(url)
				.setColor(await DbSet.fetchColor(message))
				.setImage(url)
				.setFooter(message.language.tget('POWEREDBY_WEEBSH'))
		}) as Promise<KlasaMessage | KlasaMessage[]>;
	}

}

interface WeebCommandOptions extends CommandOptions {
	queryType: string;
	responseName: keyof LanguageKeys;
}

interface WeebCommandResult {
	url: string;
}
