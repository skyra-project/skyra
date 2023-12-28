import { GuildEntity, GuildSettings, readSettings, writeSettings, type UniqueRoleSet } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand, SkyraSubcommand } from '#lib/structures';
import { PermissionLevels, type GuildMessage } from '#lib/types';
import { ApplyOptions } from '@sapphire/decorators';
import { CommandOptionsRunTypeEnum } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';

@ApplyOptions<SkyraSubcommand.Options>({
	aliases: ['rs'],
	description: LanguageKeys.Commands.Admin.RoleSetDescription,
	detailedDescription: LanguageKeys.Commands.Admin.RoleSetExtended,
	permissionLevel: PermissionLevels.Administrator,
	runIn: [CommandOptionsRunTypeEnum.GuildAny],
	subcommands: [
		{ name: 'add', messageRun: 'add' },
		{ name: 'remove', messageRun: 'remove' },
		{ name: 'reset', messageRun: 'reset' },
		{ name: 'list', messageRun: 'list' },
		{ name: 'auto', messageRun: 'auto', default: true }
	]
})
export class UserCommand extends SkyraSubcommand {
	// This subcommand will always ADD roles in to a existing set OR it will create a new set if that set does not exist
	public async add(message: GuildMessage, args: SkyraSubcommand.Args) {
		return this.handleAdd(message, await args.pick('string'), args);
	}

	// This subcommand will always remove roles from a provided role set.
	public async remove(message: GuildMessage, args: SkyraSubcommand.Args) {
		const name = await args.pick('string');
		const roles = await args.repeat('roleName');

		// Get all rolesets from settings and check if there is an existing set with the name provided by the user
		await writeSettings(message.guild, (settings) => {
			// The set does exist so we want to only REMOVE provided roles from it
			// Create a new array that we can use to overwrite the existing one in settings
			settings[GuildSettings.Roles.UniqueRoleSets] = settings[GuildSettings.Roles.UniqueRoleSets].map((set) =>
				set.name === name ? { name, roles: set.roles.filter((id: string) => !roles.find((role) => role.id === id)) } : set
			);
		});

		return send(message, args.t(LanguageKeys.Commands.Admin.RoleSetRemoved, { name, roles: roles.map((role) => role.name) }));
	}

	public async reset(message: GuildMessage, args: SkyraSubcommand.Args) {
		const [name, sets] = await Promise.all([
			args.pick('string').catch(() => null),
			// Get all rolesets from settings and check if there is an existing set with the name provided by the user
			readSettings(message.guild, GuildSettings.Roles.UniqueRoleSets)
		]);
		if (sets.length === 0) this.error(LanguageKeys.Commands.Admin.RoleSetResetEmpty);

		if (!name) {
			await writeSettings(message.guild, [[GuildSettings.Roles.UniqueRoleSets, []]]);
			return send(message, args.t(LanguageKeys.Commands.Admin.RoleSetResetAll));
		}

		const arrayIndex = sets.findIndex((set) => set.name === name);
		if (arrayIndex === -1) this.error(LanguageKeys.Commands.Admin.RoleSetResetNotExists, { name });

		await writeSettings(message.guild, (settings) => {
			settings[GuildSettings.Roles.UniqueRoleSets].splice(arrayIndex, 1);
		});

		return send(message, args.t(LanguageKeys.Commands.Admin.RoleSetResetGroup, { name }));
	}

	// This subcommand will run if a user doesn't type add or remove. The bot will then add AND remove based on whether that role is in the set already.
	public async auto(message: GuildMessage, args: SkyraSubcommand.Args) {
		const name = await args.pick('string');

		// Get all role sets from settings and check if there is an existing set with the name provided by the user
		const sets = await readSettings(message.guild, GuildSettings.Roles.UniqueRoleSets);
		const set = sets.find((set) => set.name === name);

		// If this role set does not exist we have to create it
		if (!set) return this.handleAdd(message, name, args);

		// The role set exists
		const roles = await args.repeat('roleName');
		const newSets = sets.map((set) => {
			if (set.name !== name) return set;
			// Add any role that wasn't in the set that the user provided
			// This will also remove any of the roles that user provided and were already in the set
			const newRoles = set.roles //
				.map((id) => (roles.some((role) => role.id === id) ? null : id))
				.filter((id) => id) as string[];

			for (const role of roles) if (!set.roles.includes(role.id)) newRoles.push(role.id);

			return { name, roles: newRoles };
		});

		await writeSettings(message.guild, [[GuildSettings.Roles.UniqueRoleSets, newSets]]);
		return send(message, args.t(LanguageKeys.Commands.Admin.RoleSetUpdated, { name }));
	}

	// This subcommand will show the user a list of role sets and each role in that set.
	public async list(message: GuildMessage, args: SkyraCommand.Args) {
		// Get all rolesets from settings
		const sets = await readSettings(message.guild, GuildSettings.Roles.UniqueRoleSets);
		if (sets.length === 0) this.error(LanguageKeys.Commands.Admin.RoleSetNoRoleSets);

		const list = await this.handleList(message, args, sets);
		return send(message, list.join('\n'));
	}

	private async handleList(message: GuildMessage, args: SkyraCommand.Args, sets: UniqueRoleSet[]) {
		let changed = false;

		const list: string[] = [];
		const guildRoles = message.guild.roles.cache;
		for (const set of sets) {
			const roles: string[] = [];
			for (const id of set.roles) {
				const role = guildRoles.get(id);
				if (role === undefined) {
					changed = true;
					continue;
				}

				roles.push(role.name);
			}

			if (roles.length === 0) {
				changed = true;
				continue;
			}

			list.push(`💠 **${set.name}**: ${args.t(LanguageKeys.Globals.AndListValue, { value: roles })}`);
		}

		// If there were changes, scan a second time to clean up the data:
		if (changed) {
			// If after cleaning up, all sets end up empty, reset and return error:
			if (list.length === 0) {
				await writeSettings(message.guild, [[GuildSettings.Roles.UniqueRoleSets, []]]);
				this.error(LanguageKeys.Commands.Admin.RoleSetNoRoleSets);
			}

			// Else, clean up:
			await writeSettings(message.guild, (settings) => this.cleanRoleSets(message, settings));
		}

		return list;
	}

	private cleanRoleSets(message: GuildMessage, settings: GuildEntity) {
		const guildRoles = message.guild.roles.cache;

		settings[GuildSettings.Roles.UniqueRoleSets] = settings[GuildSettings.Roles.UniqueRoleSets]
			.map((set) => ({ name: set.name, roles: set.roles.filter((role) => guildRoles.has(role)) }))
			.filter((set) => set.roles.length > 0);
	}

	private async handleAdd(message: GuildMessage, name: string, args: SkyraCommand.Args) {
		const roles = await args.repeat('roleName');

		// Get all rolesets from settings and check if there is an existing set with the name provided by the user
		const created = await writeSettings(message.guild, (settings) => {
			const allRoleSets = settings[GuildSettings.Roles.UniqueRoleSets];
			const roleSet = allRoleSets.some((set) => set.name === name);

			// If it does not exist we need to create a brand new set
			if (!roleSet) {
				allRoleSets.push({ name, roles: roles.map((role) => role.id) });
				return true;
			}

			// The set does exist so we want to only ADD new roles in
			// Create a new array that we can use to overwrite the existing one in settings
			const sets = allRoleSets.map((set) => {
				if (set.name !== name) return set;
				const finalRoles = [...set.roles];
				for (const role of roles) if (!finalRoles.includes(role.id)) finalRoles.push(role.id);

				return { name, roles: finalRoles };
			});
			settings[GuildSettings.Roles.UniqueRoleSets] = sets;

			return false;
		});

		return send(
			message,
			args.t(created ? LanguageKeys.Commands.Admin.RoleSetCreated : LanguageKeys.Commands.Admin.RoleSetAdded, {
				name,
				roles: roles.map((role) => role.name)
			})
		);
	}
}
