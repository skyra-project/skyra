import { envIsDefined } from '#lib/env';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { CustomFunctionGet, CustomGet, GuildMessage } from '#lib/types';
import { fetch, FetchResultTypes, QueryError } from '@sapphire/fetch';
import type { PieceContext } from '@sapphire/framework';
import { MessageEmbed } from 'discord.js';
import { URL } from 'url';
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

	public requireUser: boolean;

	private readonly kHeaders = {
		Authorization: `Wolke ${process.env.WEEB_SH_TOKEN}`,
		'User-Agent': `Skyra/${process.env.CLIENT_VERSION}`
	} as const;

	protected constructor(context: PieceContext, options: WeebCommand.Options) {
		super(context, {
			bucket: 2,
			cooldown: 30,
			permissions: ['EMBED_LINKS'],
			runIn: ['text', 'news'],
			...options,
			enabled: envIsDefined('WEEB_SH_TOKEN')
		});

		this.queryType = options.queryType;
		this.responseName = options.responseName;
		this.requireUser = options.requireUser ?? false;
	}

	public async run(message: GuildMessage, args: WeebCommand.Args) {
		const user = this.requireUser ? await args.pick('userName') : null;
		const query = new URL('https://api.weeb.sh/images/random');
		query.searchParams.append('type', this.queryType);
		query.searchParams.append('nsfw', String(message.channel.nsfw));

		const { t } = args;
		const { url } = await this.fetch(query);

		return message.send(user ? t(this.responseName as ComplexKey, { user: user.username }) : t(this.responseName as SimpleKey), {
			embed: new MessageEmbed()
				.setTitle('→')
				.setURL(url)
				.setColor(await this.context.db.fetchColor(message))
				.setImage(url)
				.setFooter(t(LanguageKeys.System.PoweredByWeebSh))
		});
	}

	private async fetch(url: URL): Promise<WeebCommandResult> {
		try {
			return await fetch<WeebCommandResult>(url, { headers: this.kHeaders }, FetchResultTypes.JSON);
		} catch (unknownError: unknown) {
			const error = unknownError as QueryError;

			// If we received a 5XX code error, warn the user about the service's unavailability.
			if (error.code >= 500) {
				this.error(LanguageKeys.Commands.Weeb.UnavailableError);
			}

			// If otherwise we got an 4XX error code, warn the user about unexpected error.
			this.context.client.logger.error(`Unexpected error in ${this.name}: [${error.code}] ${error.message}`);
			this.error(LanguageKeys.Commands.Weeb.UnexpectedError);
		}
	}
}

export namespace WeebCommand {
	/**
	 * The WeebCommand Options
	 */
	export type Options = SkyraCommand.Options & {
		queryType: string;
		responseName: SimpleKey | ComplexKey;
		requireUser?: boolean;
	};

	export type Args = SkyraCommand.Args;
}

interface WeebCommandResult {
	url: string;
}

type SimpleKey = CustomGet<string, string>;
type ComplexKey = CustomFunctionGet<string, { user: string }, string>;
