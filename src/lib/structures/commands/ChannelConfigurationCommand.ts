import type { GuildSettingsOfType } from '#lib/database';
import { writeSettingsTransaction } from '#lib/database/settings';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures/commands/SkyraCommand';
import { PermissionLevels, type GuildMessage, type TypedFT } from '#lib/types';
import { assertNonThread } from '#utils/functions';
import { Args, Argument, CommandOptionsRunTypeEnum, container } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import type { Nullish } from '@sapphire/utilities';
import type { TextChannel } from 'discord.js';

export abstract class ChannelConfigurationCommand extends SkyraCommand {
	private readonly responseKey: TypedFT<{ channel: string }, string>;
	private readonly settingsKey: GuildSettingsOfType<string | Nullish>;

	public constructor(context: SkyraCommand.LoaderContext, options: ChannelConfigurationCommand.Options) {
		super(context, {
			permissionLevel: PermissionLevels.Administrator,
			runIn: [CommandOptionsRunTypeEnum.GuildAny],
			...options
		});

		this.responseKey = options.responseKey;
		this.settingsKey = options.settingsKey;
	}

	public override async messageRun(message: GuildMessage, args: SkyraCommand.Args) {
		const channel = await args.pick(ChannelConfigurationCommand.hereOrTextChannelResolver);

		await using trx = await writeSettingsTransaction(message.guild);
		if (trx.settings[this.settingsKey] === channel.id) {
			this.error(LanguageKeys.Misc.ConfigurationEquals);
		}

		await trx.write({ [this.settingsKey]: channel.id }).submit();

		const content = args.t(this.responseKey, { channel: channel.toString() });
		return send(message, content);
	}

	private static hereOrTextChannelResolver = Args.make<TextChannel>((argument, context) => {
		if (argument === 'here') return Args.ok(assertNonThread(context.message.channel) as TextChannel);
		return (container.stores.get('arguments').get('textChannelName') as Argument<TextChannel>).run(argument, context);
	});
}

export namespace ChannelConfigurationCommand {
	/**
	 * The ChannelConfigurationCommand Options
	 */
	export type Options = SkyraCommand.Options & {
		responseKey: TypedFT<{ channel: string }, string>;
		settingsKey: GuildSettingsOfType<string | Nullish>;
	};

	export type Args = SkyraCommand.Args;
}
