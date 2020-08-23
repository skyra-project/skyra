import { TOKENS, VERSION } from '@root/config';
import { mergeDefault } from '@sapphire/utilities';
import { fetch, FetchResultTypes } from '@utils/util';
import { MessageEmbed, TextChannel, User } from 'discord.js';
import { CommandOptions, CommandStore, KlasaMessage, LanguageKeys, LanguageKeysComplex, LanguageKeysSimple } from 'klasa';
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
		super(
			store,
			file,
			directory,
			mergeDefault<Partial<WeebCommandOptions>, WeebCommandOptions>(
				{
					bucket: 2,
					cooldown: 30,
					requiredPermissions: ['EMBED_LINKS'],
					runIn: ['text']
				},
				options
			) as WeebCommandOptions
		);

		this.queryType = options.queryType;
		this.responseName = options.responseName;
	}

	public async run(message: KlasaMessage, params?: User[]) {
		const query = new URL('https://api-v2.weeb.sh/images/random');
		query.searchParams.append('type', this.queryType);
		query.searchParams.append('nsfw', String((message.channel as TextChannel).nsfw));

		const { url } = await fetch<WeebCommandResult>(
			query,
			{
				headers: {
					Authorization: `Wolke ${TOKENS.WEEB_SH_KEY}`,
					'User-Agent': `Skyra/${VERSION}`
				}
			},
			FetchResultTypes.JSON
		);

		return message.sendMessage(
			Boolean(this.usage.parsedUsage.length)
				? message.language.get(this.responseName as LanguageKeysComplex, { user: params![0].username })
				: message.language.get(this.responseName as LanguageKeysSimple),
			{
				embed: new MessageEmbed()
					.setTitle('→')
					.setURL(url)
					.setColor(await DbSet.fetchColor(message))
					.setImage(url)
					.setFooter(message.language.get('systemPoweredByWeebsh'))
			}
		) as Promise<KlasaMessage | KlasaMessage[]>;
	}
}

interface WeebCommandOptions extends CommandOptions {
	queryType: string;
	responseName: keyof LanguageKeys;
}

interface WeebCommandResult {
	url: string;
}
