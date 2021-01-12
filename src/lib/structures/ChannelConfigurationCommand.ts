import type { GuildEntity } from '#lib/database';
import { Nullish } from '#lib/misc';
import type { CustomFunctionGet, GuildMessage, KeyOfType } from '#lib/types';
import { PermissionLevels } from '#lib/types/Enums';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import type { TextChannel } from 'discord.js';
import type { CommandStore } from 'klasa';
import { SkyraCommand, SkyraCommandOptions } from './SkyraCommand';

export interface ChannelConfigurationCommandOptions extends SkyraCommandOptions {
	responseKey: CustomFunctionGet<string, { channel: string }, string>;
	settingsKey: KeyOfType<GuildEntity, string | Nullish>;
}

export class ChannelConfigurationCommand extends SkyraCommand {
	private readonly responseKey: CustomFunctionGet<string, { channel: string }, string>;
	private readonly settingsKey: KeyOfType<GuildEntity, string | Nullish>;

	public constructor(store: CommandStore, file: string[], directory: string, options: ChannelConfigurationCommandOptions) {
		super(store, file, directory, {
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
