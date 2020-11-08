import { GuildSettings } from '@lib/database';
import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { GuildMessage } from '@lib/types';
import { PermissionLevels } from '@lib/types/Enums';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { codeBlock } from '@sapphire/utilities';
import { ApplyOptions, CreateResolvers } from '@skyra/decorators';
import { TextChannel } from 'discord.js';

@ApplyOptions<SkyraCommandOptions>({
	bucket: 2,
	cooldown: 10,
	description: (language) => language.get(LanguageKeys.Commands.Management.ManagecommandautodeleteDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Management.ManagecommandautodeleteExtended),
	permissionLevel: PermissionLevels.Administrator,
	runIn: ['text'],
	subcommands: true,
	usage: '<show|add|remove|reset> (channel:channel) (duration:timespan)',
	usageDelim: ' '
})
@CreateResolvers([
	[
		'channel',
		async (arg, _, message, [type]) => {
			if (type === 'show' || type === 'reset') return undefined;
			if (!arg) return message.channel;
			const channel = await message.client.arguments.get('channelname')!.run(arg, _, message);
			if (channel.type === 'text') return channel;
			throw await message.fetchLocale(LanguageKeys.Commands.Management.ManageCommandAutoDeleteTextChannel);
		}
	],
	['timespan', (arg, _, message, [type]) => (type === 'add' ? message.client.arguments.get('timespan')!.run(arg, _, message) : undefined)]
])
export default class extends SkyraCommand {
	public async show(message: GuildMessage) {
		const commandAutodelete = await message.guild.readSettings(GuildSettings.CommandAutodelete);
		const language = await message.fetchLanguage();
		if (!commandAutodelete.length) throw language.get(LanguageKeys.Commands.Management.ManageCommandAutoDeleteShowEmpty);

		const list: string[] = [];
		for (const entry of commandAutodelete) {
			const channel = this.client.channels.cache.get(entry[0]) as TextChannel;
			if (channel) list.push(`${channel.name.padEnd(26)} :: ${language.duration(entry[1] / 60000)}`);
		}
		if (!list.length) throw language.get(LanguageKeys.Commands.Management.ManageCommandAutoDeleteShowEmpty);
		return message.sendLocale(LanguageKeys.Commands.Management.ManageCommandAutoDeleteShow, [
			{ codeblock: codeBlock('asciidoc', list.join('\n')) }
		]);
	}

	public async add(message: GuildMessage, [channel, duration]: [TextChannel, number]) {
		const commandAutodelete = await message.guild.readSettings(GuildSettings.CommandAutodelete);
		const index = commandAutodelete.findIndex(([id]) => id === channel.id);
		const value: readonly [string, number] = [channel.id, duration];

		if (index === -1) {
			await message.guild.writeSettings((settings) => {
				const values = settings[GuildSettings.CommandAutodelete];
				values.push(value);
				return settings.getLanguage();
			});
		} else {
			await message.guild.writeSettings((settings) => {
				const values = settings[GuildSettings.CommandAutodelete];
				values.splice(values.indexOf(value), 1);
				return settings.getLanguage();
			});
		}
		return message.sendLocale(LanguageKeys.Commands.Management.ManageCommandAutoDeleteAdd, [{ channel: channel.toString(), time: duration }]);
	}

	public async remove(message: GuildMessage, [channel]: [TextChannel]) {
		const commandAutodelete = await message.guild.readSettings(GuildSettings.CommandAutodelete);
		const index = commandAutodelete.findIndex(([id]) => id === channel.id);

		if (index !== -1) {
			await message.guild.writeSettings((settings) => {
				const values = settings[GuildSettings.CommandAutodelete];
				values.splice(index, 1);
				return settings.getLanguage();
			});
			return message.sendLocale(LanguageKeys.Commands.Management.ManageCommandAutoDeleteRemove, [{ channel: channel.toString() }]);
		}
		throw await message.fetchLocale(LanguageKeys.Commands.Management.ManageCommandAutoDeleteRemoveNotset, { channel: channel.toString() });
	}

	public async reset(message: GuildMessage) {
		await message.guild.writeSettings((settings) => {
			const values = settings[GuildSettings.CommandAutodelete];
			values.length = 0;
			return settings.getLanguage();
		});
		return message.sendLocale(LanguageKeys.Commands.Management.ManageCommandAutoDeleteReset);
	}
}
