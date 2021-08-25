import type { GuildEntity } from '#lib/database';
import { writeSettings } from '#lib/database/settings';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { CustomFunctionGet, GuildMessage } from '#lib/types';
import { PermissionLevels } from '#lib/types/Enums';
import { seconds } from '#utils/common';
import { assertNonThread } from '#utils/functions';
import { Args, container, IArgument, PieceContext } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import type { Nullish, PickByValue } from '@sapphire/utilities';
import type { TextChannel } from 'discord.js';
import { SkyraCommand } from './SkyraCommand';

export abstract class ChannelConfigurationCommand extends SkyraCommand {
	private readonly responseKey: CustomFunctionGet<string, { channel: string }, string>;
	private readonly settingsKey: PickByValue<GuildEntity, string | Nullish>;

	public constructor(context: PieceContext, options: ChannelConfigurationCommand.Options) {
		super(context, {
			permissionLevel: PermissionLevels.Administrator,
			runIn: ['GUILD_ANY'],
			...options
		});

		this.responseKey = options.responseKey;
		this.settingsKey = options.settingsKey;
	}

	public async run(message: GuildMessage, args: SkyraCommand.Args) {
		const channel = await args.pick(ChannelConfigurationCommand.hereOrTextChannelResolver);

		await writeSettings(message.guild, (settings) => {
			// If it's the same value, throw:
			if (settings[this.settingsKey] === channel.id) {
				this.error(LanguageKeys.Misc.ConfigurationEquals);
			}

			// Else set the new value:
			settings[this.settingsKey] = channel.id;
		});

		const content = args.t(this.responseKey, { channel: channel.toString() });
		return send(message, content);
	}

	private static hereOrTextChannelResolver = Args.make<TextChannel>((argument, context) => {
		if (argument === 'here') return Args.ok(assertNonThread(context.message.channel) as TextChannel);
		return (container.stores.get('arguments').get('textChannelName') as IArgument<TextChannel>).run(argument, context);
	});
}

export namespace ChannelConfigurationCommand {
	/**
	 * The ChannelConfigurationCommand Options
	 */
	export type Options = SkyraCommand.Options & {
		responseKey: CustomFunctionGet<string, { channel: string }, string>;
		settingsKey: PickByValue<GuildEntity, string | Nullish>;
	};

	export type Args = SkyraCommand.Args;
}
