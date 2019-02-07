import { Role } from 'discord.js';
import { CommandStore, KlasaClient, KlasaMessage } from 'klasa';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { GuildSettings, RolesAuto } from '../../lib/types/settings/GuildSettings';

const SORT = (x: RolesAuto, y: RolesAuto) => +(x.points > y.points) || +(x.points === y.points) - 1;

export default class extends SkyraCommand {

	public constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			aliases: ['autoroles', 'levelrole', 'lvlrole'],
			cooldown: 10,
			description: (language) => language.get('COMMAND_AUTOROLE_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_AUTOROLE_EXTENDED'),
			permissionLevel: 6,
			requiredPermissions: ['MANAGE_ROLES'],
			runIn: ['text'],
			subcommands: true,
			usage: '<add|remove|update|show:default> (role:rolename) [points:points{0,1000000}]',
			usageDelim: ' '
		});

		this.createCustomResolver('rolename', (arg, possible, msg, [type]) => {
			if (type === 'show') return undefined;
			return this.client.arguments.get('rolename').run(arg, possible, msg);
		}).createCustomResolver('points', (arg, possible, msg, [type]) => {
			if (type === 'show' || type === 'remove') return undefined;
			return this.client.arguments.get('integer').run(arg, possible, msg);
		});
	}

	public async show(message: KlasaMessage) {
		const autoRoles = message.guild.settings.get(GuildSettings.Roles.Auto) as GuildSettings.Roles.Auto;
		if (!autoRoles.length) throw message.language.get('COMMAND_AUTOROLE_LIST_EMPTY');

		const filtered = new Set(autoRoles);
		const output = [];
		for (const obj of autoRoles) {
			const role = message.guild.roles.get(obj.id);
			if (role) output.push(`${obj.points.toString().padStart(6, ' ')} : ${role.name}`);
			else filtered.delete(obj);
		}

		if (filtered.size !== autoRoles.length) await message.guild.settings.update('roles.auto', [...filtered], { arrayAction: 'overwrite' });
		if (!output.length) throw message.language.get('COMMAND_AUTOROLE_LIST_EMPTY');
		return message.sendMessage(output.join('\n'), { code: 'http' });
	}

	public async add(message: KlasaMessage, [role, points]: [Role, number]) {
		if (typeof points === 'undefined') throw message.language.get('COMMAND_AUTOROLE_POINTS_REQUIRED');
		if (typeof role === 'undefined') throw message.language.get('COMMAND_REQUIRE_ROLE');

		const autoRoles = message.guild.settings.get(GuildSettings.Roles.Auto) as GuildSettings.Roles.Auto;
		if (autoRoles.length && autoRoles.some((entry) => entry.id === role.id))
			throw message.language.get('COMMAND_AUTOROLE_UPDATE_CONFIGURED');

		await message.guild.settings.update('roles.auto', [...autoRoles, { id: role.id, points }].sort(SORT), { arrayAction: 'overwrite' });
		return message.sendLocale('COMMAND_AUTOROLE_ADD', [role, points]);
	}

	public async remove(message: KlasaMessage, [role]: [Role]) {
		if (typeof role === 'undefined') throw message.language.get('REQUIRE_ROLE');

		const autoRoles = message.guild.settings.get(GuildSettings.Roles.Auto) as GuildSettings.Roles.Auto;
		if (!autoRoles.length || !autoRoles.some((entry) => entry.id === role.id))
			throw message.language.get('COMMAND_AUTOROLE_UPDATE_UNCONFIGURED');

		const deleteEntry = autoRoles.find((entry) => entry.id === role.id);
		await message.guild.settings.update('roles.auto', deleteEntry, { arrayAction: 'remove' });

		return message.sendLocale('COMMAND_AUTOROLE_REMOVE', [role, deleteEntry.points]);
	}

	public async update(message: KlasaMessage, [role, points]: [Role, number]) {
		if (typeof points === 'undefined') throw message.language.get('COMMAND_AUTOROLE_POINTS_REQUIRED');
		if (typeof role === 'undefined') throw message.language.get('COMMAND_REQUIRE_ROLE');

		const autoRoles = message.guild.settings.get(GuildSettings.Roles.Auto) as GuildSettings.Roles.Auto;
		if (!autoRoles.length || !autoRoles.some((entry) => entry.id === role.id))
			throw message.language.get('COMMAND_AUTOROLE_UPDATE_UNCONFIGURED');

		const autoRole = autoRoles.find((entry) => entry.id === role.id);
		autoRole.points = points;
		await message.guild.settings.update('roles.auto', [...autoRoles].sort(SORT), { arrayAction: 'overwrite' });
		return message.sendLocale('COMMAND_AUTOROLE_UPDATE', [role, points, autoRole]);
	}

}
