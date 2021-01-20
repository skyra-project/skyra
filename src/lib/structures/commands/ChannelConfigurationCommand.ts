import type { GuildEntity } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { CustomFunctionGet, GuildMessage, KeyOfType } from '#lib/types';
import { PermissionLevels } from '#lib/types/Enums';
import type { Nullish } from '@sapphire/utilities';
import type { TextChannel } from 'discord.js';
import type { PieceContext } from 'klasa';
import { SkyraCommand } from './SkyraCommand';

export namespace ChannelConfigurationCommand {
	/**
	 * The ChannelConfigurationCommand Options
	 */
	export type Options = SkyraCommand.Options & {
		responseKey: CustomFunctionGet<string, { channel: string }, string>;
		settingsKey: KeyOfType<GuildEntity, string | Nullish>;
	};
}

export abstract class ChannelConfigurationCommand extends SkyraCommand {
	private readonly responseKey: CustomFunctionGet<string, { channel: string }, string>;
	private readonly settingsKey: KeyOfType<GuildEntity, string | Nullish>;

	public constructor(context: PieceContext, options: ChannelConfigurationCommand.Options) {
		super(context, {
			bucket: 2,
			cooldown: 10,
			permissionLevel: PermissionLevels.Administrator,
			runIn: ['text'],
			usage: '<here|channel:textchannelname>',
			...options
		});

		this.responseKey = options.responseKey;
		this.settingsKey = options.settingsKey;
	}

	public async run(message: GuildMessage, [channel]: [TextChannel | 'here']) {
		if (channel === 'here') channel = message.channel as TextChannel;
		const channelID = channel.id;

		const t = await message.guild.writeSettings((settings) => {
			const t = settings.getLanguage();

			// If it's the same value, throw:
			if (settings[this.settingsKey] === channelID) {
				throw t(LanguageKeys.Misc.ConfigurationEquals);
			}

			// Else set the new value:
			settings[this.settingsKey] = channelID;

			return t;
		});

		return message.send(t(this.responseKey, { channel: channel.toString() }));
	}
}
