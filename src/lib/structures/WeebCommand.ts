import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { CustomFunctionGet, CustomGet } from '@lib/types/Shared';
import { TOKENS, VERSION } from '@root/config';
import { fetch, FetchResultTypes } from '@utils/util';
import { MessageEmbed, TextChannel, User } from 'discord.js';
import { CommandOptions, CommandStore, KlasaMessage } from 'klasa';
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
	public responseName: SimpleKey | ComplexKey;

	private readonly kHeaders = {
		Authorization: `Wolke ${TOKENS.WEEB_SH_KEY}`,
		'User-Agent': `Skyra/${VERSION}`
	} as const;

	protected constructor(store: CommandStore, file: string[], directory: string, options: WeebCommandOptions) {
		super(store, file, directory, {
			bucket: 2,
			cooldown: 30,
			requiredPermissions: ['EMBED_LINKS'],
			runIn: ['text'],
			...options
		});

		this.queryType = options.queryType;
		this.responseName = options.responseName;
	}

	public async run(message: KlasaMessage, params?: User[]) {
		const query = new URL('https://api.weeb.sh/images/random');
		query.searchParams.append('type', this.queryType);
		query.searchParams.append('nsfw', String((message.channel as TextChannel).nsfw));

		const { url } = await fetch<WeebCommandResult>(query, { headers: this.kHeaders }, FetchResultTypes.JSON);

		return message.sendMessage(
			Boolean(this.usage.parsedUsage.length)
				? message.language.get(this.responseName as ComplexKey, { user: params![0].username })
				: message.language.get(this.responseName as SimpleKey),
			{
				embed: new MessageEmbed()
					.setTitle('→')
					.setURL(url)
					.setColor(await DbSet.fetchColor(message))
					.setImage(url)
					.setFooter(message.language.get(LanguageKeys.System.PoweredByWeebsh))
			}
		) as Promise<KlasaMessage | KlasaMessage[]>;
	}
}

export interface WeebCommandOptions extends CommandOptions {
	queryType: string;
	responseName: SimpleKey | ComplexKey;
}

interface WeebCommandResult {
	url: string;
}

type SimpleKey = CustomGet<string, string>;
type ComplexKey = CustomFunctionGet<string, { user: string }, string>;
