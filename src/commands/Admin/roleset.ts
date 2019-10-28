import { Role } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { GuildSettings } from '../../lib/types/settings/GuildSettings';

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['rs'],
			description: language => language.tget('COMMAND_ROLESET_DESCRIPTION'),
			permissionLevel: 6,
			requiredPermissions: [],
			runIn: ['text'],
			subcommands: true,
			usage: '<add|remove|list|auto:default> (name:name) (role:rolenames)',
			usageDelim: ' '
		});

		this.createCustomResolver(`name`, (arg, possible, message, [subcommand]) => {
			if (!arg && subcommand === 'list') return undefined;
			return this.client.arguments.get('string')!.run(arg, possible, message);
		});

		this.createCustomResolver(`rolenames`, (arg, possible, message, [subcommand]) => {
			if (!arg && subcommand === 'list') return undefined;
			return this.client.arguments.get('rolenames')!.run(arg, possible, message);
		});
	}

	// This subcommand will always ADD roles in to a existing set OR it will create a new set if that set does not exist
	public async add(message: KlasaMessage, [name, roles]: [string, Role[]]) {
		// Get all rolesets from settings and check if there is an existing set with the name provided by the user
		const allRolesets = message.guild!.settings.get(GuildSettings.Roles.UniqueRoleSets);
		const roleset = allRolesets.find(set => set.name === name);
		// If it does not exist we need to create a brand new set
		if (!roleset) {
			const { errors } = await message.guild!.settings.update(GuildSettings.Roles.UniqueRoleSets, { name, roles: roles.map(role => role.id) });
			if (errors.length) this.client.emit('error', errors.join('\n'));

			return message.sendLocale(`COMMAND_ROLESET_CREATED`, [name, roles.map(role => role.name).join(', ')]);
		}

		// The set does exist so we want to only ADD new roles in

		// Create a new array that we can use to overwrite the existing one in settings
		const newsets = allRolesets.map(set => {
			if (set.name !== name) return set;
			const finalRoleIDs = [...set.roles];
			for (const role of roles) if (!finalRoleIDs.includes(role.id)) finalRoleIDs.push(role.id);

			return { name, roles: finalRoleIDs };
		});

		const { errors } = await message.guild!.settings.update(GuildSettings.Roles.UniqueRoleSets, newsets, { arrayAction: 'overwrite' });
		if (errors.length) this.client.emit('error', errors.join('\n'));

		return message.sendLocale('COMMAND_ROLESET_ADDED', [name, roles.map(role => role.name).join(', ')]);
	}

	// This subcommand will always remove roles from a provided role set.
	public async remove(message: KlasaMessage, [name, roles]: [string, Role[]]) {
		// Get all rolesets from settings and check if there is an existing set with the name provided by the user
		const allRolesets = message.guild!.settings.get(GuildSettings.Roles.UniqueRoleSets);
		// The set does exist so we want to only REMOVE provided roles from it
		// Create a new array that we can use to overwrite the existing one in settings
		const newsets = allRolesets.map(set => set.name === name ? { name, roles: set.roles.filter((id: string) => !roles.find(role => role.id === id)) } : set);

		const { errors } = await message.guild!.settings.update(GuildSettings.Roles.UniqueRoleSets, newsets, { arrayAction: 'overwrite' });
		if (errors.length) this.client.emit('error', errors.join('\n'));

		return message.sendLocale('COMMAND_ROLESET_REMOVED', [name, roles.map(role => role.name).join(', ')]);
	}

	// This subcommand will run if a user doesnt type add or remove. The bot will then add AND remove based on whether that role is in the set already.
	public async auto(message: KlasaMessage, [name, roles]: [string, Role[]]) {
		// Get all rolesets from settings and check if there is an existing set with the name provided by the user
		const allRolesets = message.guild!.settings.get(GuildSettings.Roles.UniqueRoleSets);
		const roleset = allRolesets.find(set => set.name === name);
		// If this roleset does not exist we have to create it
		if (!roleset) return this.add(message, [name, roles]);

		// The role set exists

		const newsets = allRolesets.map(set => {
			if (set.name !== name) return set;
			// Add any role that wasnt in the set that the user provided
			// This will also remove any of the roles that user provided and were already in the set
			const newroles = set.roles.map(id => roles.find(role => role.id === id) ? null : id).filter(id => id);

			for (const role of roles) if (!set.roles.includes(role.id)) newroles.push(role.id);

			return { name, roles: newroles };
		});

		const { errors } = await message.guild!.settings.update(GuildSettings.Roles.UniqueRoleSets, newsets, { arrayAction: 'overwrite' });
		if (errors.length) this.client.emit('error', errors.join('\n'));

		return message.sendLocale(`COMMAND_ROLESET_UPDATED`, [name]);
	}

	// This subcommand will show the user a list of role sets and each role in that set.
	public async list(message: KlasaMessage) {
		// Get all rolesets from settings
		const allRolesets = message.guild!.settings.get(GuildSettings.Roles.UniqueRoleSets);
		if (!allRolesets.length) return message.send('You have no rolesets.');
		const list = allRolesets.map(set => `💠 **${set.name}**: ${set.roles.map(id => message.guild!.roles.get(id)!.name).join(', ')}`);
		return message.send(list);
	}

}
