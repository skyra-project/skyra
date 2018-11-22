import { Command, MessageEmbed } from '../../../index';

const SORT = (x, y) => +(y.position > x.position) || +(x.position === y.position) - 1;

export default class extends Command {

	public constructor(client: Client, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			aliases: ['serverinfo'],
			requiredPermissions: ['EMBED_LINKS'],
			cooldown: 15,
			description: (language) => language.get('COMMAND_GUILDINFO_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_GUILDINFO_EXTENDED'),
			runIn: ['text']
		});
	}

	public async run(msg) {
		let tChannels = 0, vChannels = 0, cChannels = 0;
		for (const channel of msg.guild.channels.values()) {
			if (channel.type === 'text') tChannels++;
			else if (channel.type === 'voice') vChannels++;
			else cChannels++;
		}

		const i18n = msg.language, { COMMAND_SERVERINFO_TITLES } = i18n.language, roles = [...msg.guild.roles.values()].sort(SORT);
		roles.pop();
		const owner = await this.client.users.fetch(msg.guild.ownerID);
		return msg.sendEmbed(new MessageEmbed()
			.setColor(msg.member.displayColor || msg.guild.me.displayColor || 0xDFDFDF)
			.setThumbnail(msg.guild.iconURL())
			.setTitle(`${msg.guild.name} [${msg.guild.id}]`)
			.splitFields(i18n.get('COMMAND_SERVERINFO_ROLES', !roles.length ? i18n.get('COMMAND_SERVERINFO_NOROLES') : roles.map((role) => role.name).join(', ')))
			.addField(COMMAND_SERVERINFO_TITLES.CHANNELS, i18n.get('COMMAND_SERVERINFO_CHANNELS',
				tChannels, vChannels, cChannels, msg.guild.afkChannelID, msg.guild.afkTimeout), true)
			.addField(COMMAND_SERVERINFO_TITLES.MEMBERS, i18n.get('COMMAND_SERVERINFO_MEMBERS',
				msg.guild.memberCount, owner), true)
			.addField(COMMAND_SERVERINFO_TITLES.OTHER, i18n.get('COMMAND_SERVERINFO_OTHER',
				msg.guild.roles.size, msg.guild.region, msg.guild.createdAt, msg.guild.verificationLevel), true));
	}

}
