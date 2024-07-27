import { readSettings, writeSettings, writeSettingsTransaction, type ReadonlyGuildEntity, type UniqueRoleSet } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand, SkyraSubcommand } from '#lib/structures';
import { PermissionLevels, type GuildMessage } from '#lib/types';
import { ApplyOptions } from '@sapphire/decorators';
import { CommandOptionsRunTypeEnum } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';

const Root = LanguageKeys.Commands.Admin;

@ApplyOptions<SkyraSubcommand.Options>({
	aliases: ['rs'],
	description: Root.RoleSetDescription,
	detailedDescription: Root.RoleSetExtended,
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
		await writeSettings(message.guild, (settings) => ({
			// The set does exist so we want to only REMOVE provided roles from it
			// Create a new array that we can use to overwrite the existing one in settings
			rolesUniqueRoleSets: settings.rolesUniqueRoleSets.map((set) =>
				set.name === name ? { name, roles: set.roles.filter((id: string) => !roles.find((role) => role.id === id)) } : set
			)
		}));

		return send(message, args.t(Root.RoleSetRemoved, { name, roles: roles.map((role) => role.name) }));
	}

	public async reset(message: GuildMessage, args: SkyraSubcommand.Args) {
		const [name, sets] = await Promise.all([
			args.pick('string').catch(() => null),
			// Get all rolesets from settings and check if there is an existing set with the name provided by the user
			this.#getUniqueRoleSets(message)
		]);
		if (sets.length === 0) this.error(Root.RoleSetResetEmpty);

		if (!name) {
			await writeSettings(message.guild, { rolesUniqueRoleSets: [] });
			return send(message, args.t(Root.RoleSetResetAll));
		}

		const arrayIndex = sets.findIndex((set) => set.name === name);
		if (arrayIndex === -1) this.error(Root.RoleSetResetNotExists, { name });

		await writeSettings(message.guild, {
			rolesUniqueRoleSets: sets.toSpliced(arrayIndex, 1)
		});

		return send(message, args.t(Root.RoleSetResetGroup, { name }));
	}

	// This subcommand will run if a user doesn't type add or remove. The bot will then add AND remove based on whether that role is in the set already.
	public async auto(message: GuildMessage, args: SkyraSubcommand.Args) {
		const name = await args.pick('string');

		// Get all role sets from settings and check if there is an existing set with the name provided by the user
		const sets = await this.#getUniqueRoleSets(message);
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

		await writeSettings(message.guild, { rolesUniqueRoleSets: newSets });
		return send(message, args.t(Root.RoleSetUpdated, { name }));
	}

	// This subcommand will show the user a list of role sets and each role in that set.
	public async list(message: GuildMessage, args: SkyraCommand.Args) {
		// Get all rolesets from settings
		const sets = await this.#getUniqueRoleSets(message);
		if (sets.length === 0) this.error(Root.RoleSetNoRoleSets);

		const list = await this.handleList(message, args, sets);
		return send(message, list.join('\n'));
	}

	private async handleList(message: GuildMessage, args: SkyraCommand.Args, sets: readonly UniqueRoleSet[]) {
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
				await writeSettings(message.guild, { rolesUniqueRoleSets: [] });
				this.error(Root.RoleSetNoRoleSets);
			}

			// Else, clean up:
			await writeSettings(message.guild, (settings) => ({
				rolesUniqueRoleSets: this.cleanRoleSets(message, settings)
			}));
		}

		return list;
	}

	private cleanRoleSets(message: GuildMessage, settings: ReadonlyGuildEntity) {
		const guildRoles = message.guild.roles.cache;

		return settings.rolesUniqueRoleSets
			.map((set) => ({ name: set.name, roles: set.roles.filter((role) => guildRoles.has(role)) }))
			.filter((set) => set.roles.length > 0);
	}

	private async handleAdd(message: GuildMessage, name: string, args: SkyraCommand.Args) {
		const roles = await args.repeat('roleName');

		// Get all rolesets from settings and check if there is an existing set with the name provided by the user
		await using trx = await writeSettingsTransaction(message.guild);

		const entries = trx.settings.rolesUniqueRoleSets;
		const index = entries.findIndex((set) => set.name === name);

		// If it does not exist we need to create a brand new set
		if (index === -1) {
			const rolesUniqueRoleSets = entries.concat({ name, roles: roles.map((role) => role.id) });
			trx.write({ rolesUniqueRoleSets });
		} else {
			// The set does exist so we want to only ADD new roles in
			// Create a new array that we can use to overwrite the existing one in settings
			const entry = entries[index];
			const rolesUniqueRoleSets = entries.with(index, { name, roles: entry.roles.concat(roles.map((role) => role.id)) });
			trx.write({ rolesUniqueRoleSets });
		}
		await trx.submit();

		const created = index === -1;
		const key = created ? Root.RoleSetCreated : Root.RoleSetAdded;
		return send(message, args.t(key, { name, roles: roles.map((role) => role.name) }));
	}

	async #getUniqueRoleSets(message: GuildMessage) {
		const settings = await readSettings(message.guild);
		return settings.rolesUniqueRoleSets;
	}
}
