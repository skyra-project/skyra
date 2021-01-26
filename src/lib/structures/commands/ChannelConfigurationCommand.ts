import type { GuildEntity } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { CustomFunctionGet, GuildMessage, KeyOfType } from '#lib/types';
import { PermissionLevels } from '#lib/types/Enums';
import { Args, IArgument, PieceContext, Store } from '@sapphire/framework';
import type { Nullish } from '@sapphire/utilities';
import type { TextChannel } from 'discord.js';
import { SkyraCommand } from './SkyraCommand';

export namespace ChannelConfigurationCommand {
	/**
	 * The ChannelConfigurationCommand Options
	 */
	export type Options = SkyraCommand.Options & {
		responseKey: CustomFunctionGet<string, { channel: string }, string>;
		settingsKey: KeyOfType<GuildEntity, string | Nullish>;
	};

	export type Args = SkyraCommand.Args;
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
			...options
		});

		this.responseKey = options.responseKey;
		this.settingsKey = options.settingsKey;
	}

	public async run(message: GuildMessage, args: SkyraCommand.Args) {
		const channel = await args.pick(ChannelConfigurationCommand.hereOrTextChannelResolver);

		await message.guild.writeSettings((settings) => {
			// If it's the same value, throw:
			if (settings[this.settingsKey] === channel.id) {
				throw args.t(LanguageKeys.Misc.ConfigurationEquals);
			}

			// Else set the new value:
			settings[this.settingsKey] = channel.id;
		});

		return message.send(args.t(this.responseKey, { channel: channel.toString() }));
	}

	private static hereOrTextChannelResolver = Args.make<TextChannel>((argument, context) => {
		if (argument === 'here') return Args.ok(context.message.channel as TextChannel);
		return (Store.injectedContext.stores.get('arguments').get('textchannelname') as IArgument<TextChannel>).run(argument, context);
	});
}
