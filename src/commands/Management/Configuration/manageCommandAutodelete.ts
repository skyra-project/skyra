import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { PermissionLevels } from '@lib/types/Enums';
import { GuildSettings } from '@lib/types/namespaces/GuildSettings';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { codeBlock } from '@sapphire/utilities';
import { ApplyOptions, CreateResolvers } from '@skyra/decorators';
import { TextChannel } from 'discord.js';
import { KlasaMessage } from 'klasa';

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
			throw message.language.get(LanguageKeys.Commands.Management.ManageCommandAutoDeleteTextChannel);
		}
	],
	['timespan', (arg, _, message, [type]) => (type === 'add' ? message.client.arguments.get('timespan')!.run(arg, _, message) : undefined)]
])
export default class extends SkyraCommand {
	public async show(message: KlasaMessage) {
		const commandAutodelete = message.guild!.settings.get(GuildSettings.CommandAutodelete);
		if (!commandAutodelete.length) throw message.language.get(LanguageKeys.Commands.Management.ManageCommandAutoDeleteShowEmpty);

		const list: string[] = [];
		for (const entry of commandAutodelete) {
			const channel = this.client.channels.cache.get(entry[0]) as TextChannel;
			if (channel) list.push(`${channel.name.padEnd(26)} :: ${message.language.duration(entry[1] / 60000)}`);
		}
		if (!list.length) throw message.language.get(LanguageKeys.Commands.Management.ManageCommandAutoDeleteShowEmpty);
		return message.sendLocale(LanguageKeys.Commands.Management.ManageCommandAutoDeleteShow, [
			{ codeblock: codeBlock('asciidoc', list.join('\n')) }
		]);
	}

	public async add(message: KlasaMessage, [channel, duration]: [TextChannel, number]) {
		const commandAutodelete = message.guild!.settings.get(GuildSettings.CommandAutodelete);
		const index = commandAutodelete.findIndex(([id]) => id === channel.id);
		const value: readonly [string, number] = [channel.id, duration];

		if (index === -1) {
			await message.guild!.settings.update(GuildSettings.CommandAutodelete, [value], {
				arrayAction: 'add',
				extraContext: { author: message.author.id }
			});
		} else {
			await message.guild!.settings.update(GuildSettings.CommandAutodelete, value, {
				arrayIndex: index,
				extraContext: { author: message.author.id }
			});
		}
		return message.sendLocale(LanguageKeys.Commands.Management.ManageCommandAutoDeleteAdd, [{ channel: channel.toString(), time: duration }]);
	}

	public async remove(message: KlasaMessage, [channel]: [TextChannel]) {
		const commandAutodelete = message.guild!.settings.get(GuildSettings.CommandAutodelete);
		const index = commandAutodelete.findIndex(([id]) => id === channel.id);

		if (index !== -1) {
			await message.guild!.settings.update(GuildSettings.CommandAutodelete, commandAutodelete[index], {
				arrayIndex: index,
				extraContext: { author: message.author.id }
			});
			return message.sendLocale(LanguageKeys.Commands.Management.ManageCommandAutoDeleteRemove, [{ channel: channel.toString() }]);
		}
		throw message.language.get(LanguageKeys.Commands.Management.ManageCommandAutoDeleteRemoveNotset, { channel: channel.toString() });
	}

	public async reset(message: KlasaMessage) {
		await message.guild!.settings.reset(GuildSettings.CommandAutodelete);
		return message.sendLocale(LanguageKeys.Commands.Management.ManageCommandAutoDeleteReset);
	}
}
