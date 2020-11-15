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
	description: (language) => language.get(LanguageKeys.Commands.Management.ManageCommandAutoDeleteDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Management.ManageCommandAutoDeleteExtended),
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
		const [commandAutoDelete, language] = await message.guild.readSettings((settings) => [
			settings[GuildSettings.CommandAutoDelete],
			settings.getLanguage()
		]);
		if (!commandAutoDelete.length) throw language.get(LanguageKeys.Commands.Management.ManageCommandAutoDeleteShowEmpty);

		const list: string[] = [];
		for (const entry of commandAutoDelete) {
			const channel = this.client.channels.cache.get(entry[0]) as TextChannel;
			if (channel) list.push(`${channel.name.padEnd(26)} :: ${language.duration(entry[1] / 60000)}`);
		}
		if (!list.length) throw language.get(LanguageKeys.Commands.Management.ManageCommandAutoDeleteShowEmpty);
		return message.send(
			language.get(LanguageKeys.Commands.Management.ManageCommandAutoDeleteShow, { codeblock: codeBlock('asciidoc', list.join('\n')) })
		);
	}

	public async add(message: GuildMessage, [channel, duration]: [TextChannel, number]) {
		const language = await message.guild.writeSettings((settings) => {
			const commandAutodelete = settings[GuildSettings.CommandAutoDelete];
			const index = commandAutodelete.findIndex(([id]) => id === channel.id);
			const value: readonly [string, number] = [channel.id, duration];

			if (index === -1) commandAutodelete.push(value);
			else commandAutodelete[index] = value;

			return settings.getLanguage();
		});

		return message.send(
			language.get(LanguageKeys.Commands.Management.ManageCommandAutoDeleteAdd, { channel: channel.toString(), time: duration })
		);
	}

	public async remove(message: GuildMessage, [channel]: [TextChannel]) {
		const language = await message.guild.writeSettings((settings) => {
			const commandAutodelete = settings[GuildSettings.CommandAutoDelete];
			const index = commandAutodelete.findIndex(([id]) => id === channel.id);
			const language = settings.getLanguage();

			if (index === -1) {
				throw language.get(LanguageKeys.Commands.Management.ManageCommandAutoDeleteRemoveNotSet, { channel: channel.toString() });
			}

			commandAutodelete.splice(index, 1);
			return language;
		});

		return message.send(language.get(LanguageKeys.Commands.Management.ManageCommandAutoDeleteRemove, { channel: channel.toString() }));
	}

	public async reset(message: GuildMessage) {
		const language = await message.guild.writeSettings((settings) => {
			settings[GuildSettings.CommandAutoDelete].length = 0;
			return settings.getLanguage();
		});

		return message.send(language.get(LanguageKeys.Commands.Management.ManageCommandAutoDeleteReset));
	}
}
