import { readSettings, writeSettingsTransaction } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraSubcommand } from '#lib/structures';
import { PermissionLevels, type GuildMessage } from '#lib/types';
import { ApplyOptions } from '@sapphire/decorators';
import { CommandOptionsRunTypeEnum } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';

@ApplyOptions<SkyraSubcommand.Options>({
	aliases: ['mcc'],
	description: LanguageKeys.Commands.Management.ManageCommandChannelDescription,
	detailedDescription: LanguageKeys.Commands.Management.ManageCommandChannelExtended,
	permissionLevel: PermissionLevels.Administrator,
	runIn: [CommandOptionsRunTypeEnum.GuildAny],
	subcommands: [
		{ name: 'add', messageRun: 'add' },
		{ name: 'remove', messageRun: 'remove' },
		{ name: 'reset', messageRun: 'reset' },
		{ name: 'show', messageRun: 'show', default: true }
	]
})
export class UserCommand extends SkyraSubcommand {
	public async add(message: GuildMessage, args: SkyraSubcommand.Args) {
		const channel = await args.pick('textChannelName');
		const command = await args.pick('command');

		await using trx = await writeSettingsTransaction(message.guild);

		const index = trx.settings.disabledCommandsChannels.findIndex((entry) => entry.channel === channel.id);
		if (index === -1) {
			trx.write({
				disabledCommandsChannels: trx.settings.disabledCommandsChannels.concat({ channel: channel.id, commands: [command.name] })
			});
		} else {
			const entry = trx.settings.disabledCommandsChannels[index];
			if (entry.commands.includes(command.name)) {
				this.error(LanguageKeys.Commands.Management.ManageCommandChannelAddAlreadySet);
			}

			trx.write({
				disabledCommandsChannels: trx.settings.disabledCommandsChannels.with(index, {
					channel: channel.id,
					commands: entry.commands.concat(command.name)
				})
			});
		}

		await trx.submit();

		const content = args.t(LanguageKeys.Commands.Management.ManageCommandChannelAdd, { channel: channel.toString(), command: command.name });
		return send(message, content);
	}

	public async remove(message: GuildMessage, args: SkyraSubcommand.Args) {
		const channel = await args.pick('textChannelName');
		const command = await args.pick('command');

		await using trx = await writeSettingsTransaction(message.guild);

		const index = trx.settings.disabledCommandsChannels.findIndex((entry) => entry.channel === channel.id);
		if (index === -1) {
			this.error(LanguageKeys.Commands.Management.ManageCommandChannelRemoveNotSet, { channel: channel.toString() });
		}

		const entry = trx.settings.disabledCommandsChannels[index];
		const commandIndex = entry.commands.indexOf(command.name);
		if (commandIndex === -1) {
			this.error(LanguageKeys.Commands.Management.ManageCommandChannelRemoveNotSet, { channel: channel.toString() });
		}

		const disabledCommandsChannels =
			entry.commands.length === 1
				? trx.settings.disabledCommandsChannels.toSpliced(index, 1)
				: trx.settings.disabledCommandsChannels.with(index, { channel: channel.id, commands: entry.commands.toSpliced(commandIndex, 1) });
		await trx.write({ disabledCommandsChannels }).submit();

		const content = args.t(LanguageKeys.Commands.Management.ManageCommandChannelRemove, { channel: channel.toString(), command: command.name });
		return send(message, content);
	}

	public async reset(message: GuildMessage, args: SkyraSubcommand.Args) {
		const channel = await args.pick('textChannelName');

		await using trx = await writeSettingsTransaction(message.guild);

		const index = trx.settings.disabledCommandsChannels.findIndex((entry) => entry.channel === channel.id);
		if (index === -1) {
			this.error(LanguageKeys.Commands.Management.ManageCommandChannelResetEmpty);
		}

		await trx.write({ disabledCommandsChannels: trx.settings.disabledCommandsChannels.toSpliced(index, 1) }).submit();

		const content = args.t(LanguageKeys.Commands.Management.ManageCommandChannelReset, { channel: channel.toString() });
		return send(message, content);
	}

	public async show(message: GuildMessage, args: SkyraSubcommand.Args) {
		const channel = await args.pick('textChannelName');
		const settings = await readSettings(message.guild);

		const { disabledCommandsChannels } = settings;
		const entry = disabledCommandsChannels.find((e) => e.channel === channel.id);
		if (!entry?.commands.length) {
			this.error(LanguageKeys.Commands.Management.ManageCommandChannelShowEmpty);
		}

		const content = args.t(LanguageKeys.Commands.Management.ManageCommandChannelShow, {
			channel: channel.toString(),
			commands: `\`${entry.commands.join('` | `')}\``
		});
		return send(message, content);
	}
}
