import { FetchError } from '#lib/errors/FetchError';
import { CustomFunctionGet, CustomGet, GuildMessage } from '#lib/types';
import { Events } from '#lib/types/Enums';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { TOKENS, VERSION } from '#root/config';
import { fetch, FetchResultTypes } from '#utils/util';
import { MessageEmbed, User } from 'discord.js';
import { CommandOptions, CommandStore, KlasaMessage, Language } from 'klasa';
import { DbSet } from '../database/structures/DbSet';
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

	public async run(message: GuildMessage, params?: User[]) {
		const query = new URL('https://api.weeb.sh/images/random');
		query.searchParams.append('type', this.queryType);
		query.searchParams.append('nsfw', String(message.channel.nsfw));

		const language = await message.guild.fetchLanguage();
		const { url } = await this.fetch(language, query);

		return message.sendMessage(
			Boolean(this.usage.parsedUsage.length)
				? language.get(this.responseName as ComplexKey, { user: params![0].username })
				: language.get(this.responseName as SimpleKey),
			{
				embed: new MessageEmbed()
					.setTitle('→')
					.setURL(url)
					.setColor(await DbSet.fetchColor(message))
					.setImage(url)
					.setFooter(language.get(LanguageKeys.System.PoweredByWeebSh))
			}
		) as Promise<KlasaMessage | KlasaMessage[]>;
	}

	private async fetch(language: Language, url: URL): Promise<WeebCommandResult> {
		try {
			return await fetch<WeebCommandResult>(url, { headers: this.kHeaders }, FetchResultTypes.JSON);
		} catch (unknownError: unknown) {
			const error = unknownError as FetchError;

			// If we received a 5XX code error, warn the user about the service's unavailability.
			if (error.code >= 500) {
				throw language.get(LanguageKeys.Commands.Weeb.UnavailableError);
			}

			// If otherwise we got an 4XX error code, warn the user about unexpected error.
			this.client.emit(Events.Error, `Unexpected error in ${this.name}: [${error.code}] ${error.message}`);
			throw language.get(LanguageKeys.Commands.Weeb.UnexpectedError);
		}
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
