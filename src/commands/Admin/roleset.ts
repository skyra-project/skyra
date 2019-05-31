import { Role } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { GuildSettings } from '../../lib/types/settings/GuildSettings';

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['rs'],
			description: language => language.get('COMMAND_ROLESET_DESCRIPTION'),
			permissionLevel: 6,
			requiredPermissions: [],
			runIn: ['text'],
			subcommands: true,
			usage: '<add|remove|auto:default> <name:string> <role:rolename> [...]',
			usageDelim: ' '
		});
	}

	public async add(message: KlasaMessage, [name, roles]: [string, Role[]]) {
		// Get all rolesets from settings and check if there is an existing set with the name provided by the user
		const allRolesets = message.guild.settings.get(GuildSettings.Roles.UniqueRoleSets) as GuildSettings.Roles.UniqueRoleSets;
		const roleset = allRolesets.find(set => set.name === name);

		// If it does not exist we need to create a brand new set
		if (!roleset) {
			const { errors } = await message.guild.settings.update(GuildSettings.Roles.UniqueRoleSets, [{ name, roles }]);
			if (errors.length) this.client.emit('error', errors.join('\n'));

			return message.sendLocale(`COMMAND_ROLESET_CREATED`, [name, roles]);
		}

		// The set does exist so we want to only ADD new roles in

		// Create a new array that we can use to overwrite the existing one in settings
		const newsets = allRolesets.map(set => {
			if (set.name !== name) return set;
			const finalRoleIDs = [...set.roles];
			for (const role of roles) if (!finalRoleIDs.includes(role.id)) finalRoleIDs.push(role.id);

			return { name, roles: finalRoleIDs };
		});

		const { errors } = await message.guild.settings.update(GuildSettings.Roles.UniqueRoleSets, newsets, { arrayAction: 'overwrite' });
		if (errors.length) this.client.emit('error', errors.join('\n'));

		return message.sendLocale('COMMAND_ROLESETS_ADDED', [name, roles]);
	}

	public async remove(message: KlasaMessage, [name, roles]: [string, Role[]]) {
		// Get all rolesets from settings and check if there is an existing set with the name provided by the user
		const allRolesets = message.guild.settings.get(GuildSettings.Roles.UniqueRoleSets) as GuildSettings.Roles.UniqueRoleSets;
		const roleset = allRolesets.find(set => set.name === name);

		// TODO: Kyra if name is a semi we can add this check in a custom resolver
		if (!roleset) return message.sendLocale(`COMMAND_ROLESET_INVALID_NAME`, [name]);

		// The set does exist so we want to only REMOVE provided roles from it

		// Create a new array that we can use to overwrite the existing one in settings
		const newsets = allRolesets.map(set => set.name === name ? set : [{ name, roles: set.roles.filter((id: string) => !roles.find(role => role.id === id)) }]);

		const { errors } = await message.guild.settings.update(GuildSettings.Roles.UniqueRoleSets, newsets, { arrayAction: 'overwrite' });
		if (errors.length) this.client.emit('error', errors.join('\n'));

		return message.sendLocale('COMMAND_ROLESETS_REMOVED', [name, roles]);
	}

	public async auto(message: KlasaMessage, [name, roles]: [string, Role[]]) {
		// Get all rolesets from settings and check if there is an existing set with the name provided by the user
		const allRolesets = message.guild.settings.get(GuildSettings.Roles.UniqueRoleSets) as GuildSettings.Roles.UniqueRoleSets;
		const roleset = allRolesets.find(set => set.name === name);

		if (!roleset) return this.add(message, [name, roles]);
		return this.remove(message, [name, roles]);
	}

}
