import { envIsDefined } from '#lib/env';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { CustomFunctionGet, CustomGet, GuildMessage } from '#lib/types';
import { isNsfwChannel } from '@sapphire/discord.js-utilities';
import { fetch, FetchResultTypes, QueryError } from '@sapphire/fetch';
import { CommandOptionsRunTypeEnum, PieceContext } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import { PermissionFlagsBits } from 'discord-api-types/v9';
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
			requiredClientPermissions: [PermissionFlagsBits.EmbedLinks],
			runIn: [CommandOptionsRunTypeEnum.GuildAny],
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
		query.searchParams.append('nsfw', String(isNsfwChannel(message.channel)));

		const { t } = args;
		const { url } = await this.fetch(query);

		const content = user ? t(this.responseName as ComplexKey, { user: user.username }) : t(this.responseName as SimpleKey);
		const embed = new MessageEmbed()
			.setTitle('→')
			.setURL(url)
			.setColor(await this.container.db.fetchColor(message))
			.setImage(url)
			.setFooter(t(LanguageKeys.System.PoweredByWeebSh));
		return send(message, { content, embeds: [embed] });
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
			this.container.logger.error(`Unexpected error in ${this.name}: [${error.code}] ${error.message}`);
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
