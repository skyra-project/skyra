import { GuildEntity, PermissionNodeAction, PermissionNodeManager, type PermissionsNode } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { UserError } from '@sapphire/framework';
import type { Guild, GuildMember, Role, User } from 'discord.js';
import { fail } from 'node:assert';
import { createGuild, createGuildMember, createRole, createUser, roleData } from '../../../../mocks/MockInstances.js';
import { GuildData } from '#lib/database/settings';

describe('PermissionNodeManager', () => {
	let guild: Guild;
	let entity: GuildData;
	let ctx: PermissionNodeManager | null;

	beforeEach(() => {
		guild = createGuild();
		entity = new GuildEntity();
		entity.id = guild.id;
		ctx = null;
	});

	function readSettingsPermissionNodes() {
		return (ctx ??= new PermissionNodeManager(entity));
	}

	function getSorted() {
		const ctx = readSettingsPermissionNodes();
		// eslint-disable-next-line @typescript-eslint/dot-notation
		return ctx['sorted'];
	}

	describe('has', () => {
		test('GIVEN a guild with no roles THEN returns false', () => {
			const ctx = readSettingsPermissionNodes();
			expect(ctx.has('1')).toBe(false);
		});
	});

	function apply(target: User | GuildMember | Role, nodes: readonly PermissionsNode[]) {
		const ctx = readSettingsPermissionNodes();
		Object.assign(entity, { [ctx.settingsPropertyFor(target)]: nodes });
		ctx.refresh(entity);
	}

	describe('add', () => {
		function add(target: User | GuildMember | Role, command: string, action: PermissionNodeAction) {
			const ctx = readSettingsPermissionNodes();
			const nodes = ctx.add(target, command, action);
			apply(target, nodes);
		}

		describe('user', () => {
			const user = createUser();

			test('GIVEN an User with no node THEN creates new one', () => {
				add(user, 'ping', PermissionNodeAction.Allow);

				expect(entity.permissionsRoles).toEqual<PermissionsNode[]>([]);
				expect(entity.permissionsUsers).toEqual<PermissionsNode[]>([{ id: user.id, allow: ['ping'], deny: [] }]);
			});

			test('GIVEN an User with a node THEN modifies existing one', () => {
				add(user, 'ping', PermissionNodeAction.Allow);
				add(user, 'balance', PermissionNodeAction.Allow);

				expect(entity.permissionsRoles).toEqual<PermissionsNode[]>([]);
				expect(entity.permissionsUsers).toEqual<PermissionsNode[]>([{ id: user.id, allow: ['ping', 'balance'], deny: [] }]);
			});
		});

		describe('member', () => {
			const member = createGuildMember({}, guild);

			test('GIVEN a GuildMember with no node THEN creates new one', () => {
				add(member, 'ping', PermissionNodeAction.Deny);

				expect(entity.permissionsRoles).toEqual<PermissionsNode[]>([]);
				expect(entity.permissionsUsers).toEqual<PermissionsNode[]>([{ id: member.id, allow: [], deny: ['ping'] }]);
			});

			test('GIVEN a GuildMember with a node THEN modifies existing one', () => {
				add(member, 'ping', PermissionNodeAction.Deny);
				add(member, 'balance', PermissionNodeAction.Deny);

				expect(entity.permissionsRoles).toEqual<PermissionsNode[]>([]);
				expect(entity.permissionsUsers).toEqual<PermissionsNode[]>([{ id: member.id, allow: [], deny: ['ping', 'balance'] }]);
			});
		});

		describe('role', () => {
			test('GIVEN a Role with no node THEN creates new one', () => {
				const role = guild.roles.cache.get(roleData.id)!;
				add(role, 'ping', PermissionNodeAction.Allow);

				expect(entity.permissionsRoles).toEqual<PermissionsNode[]>([{ id: role.id, allow: ['ping'], deny: [] }]);
				expect(entity.permissionsUsers).toEqual<PermissionsNode[]>([]);
			});

			test('GIVEN a Role with a node THEN modifies existing one', () => {
				const role = guild.roles.cache.get(roleData.id)!;
				add(role, 'ping', PermissionNodeAction.Allow);
				add(role, 'balance', PermissionNodeAction.Deny);

				expect(entity.permissionsRoles).toEqual<PermissionsNode[]>([{ id: role.id, allow: ['ping'], deny: ['balance'] }]);
				expect(entity.permissionsUsers).toEqual<PermissionsNode[]>([]);
			});
		});
	});

	describe('reset', () => {
		function reset(target: User | GuildMember | Role) {
			const ctx = readSettingsPermissionNodes();
			const nodes = ctx.reset(target);
			apply(target, nodes);
		}

		describe('user', () => {
			const user = createUser();

			test('GIVEN an empty node THEN throws error', () => {
				try {
					reset(user);
					fail();
				} catch (error: unknown) {
					const casted = error as UserError;

					expect(casted).toBeInstanceOf(UserError);
					expect(casted.identifier).toBe(LanguageKeys.Commands.Management.PermissionNodesNodeNotExists);
					expect((casted.context as { target: typeof user }).target).toBe(user);
				}
			});
		});

		describe('member', () => {
			test('GIVEN an empty node THEN throws error', () => {
				const member = createGuildMember({}, guild);

				try {
					reset(member);
					fail();
				} catch (error: unknown) {
					const casted = error as UserError;

					expect(casted).toBeInstanceOf(UserError);
					expect(casted.identifier).toBe(LanguageKeys.Commands.Management.PermissionNodesNodeNotExists);
					expect((casted.context as { target: typeof member }).target).toBe(member);
				}
			});
		});

		describe('role', () => {
			test('GIVEN an empty node THEN throws error', () => {
				const role = createGuildMember({}, guild);
				try {
					reset(role);
					fail();
				} catch (error: unknown) {
					const casted = error as UserError;

					expect(casted).toBeInstanceOf(UserError);
					expect(casted.identifier).toBe(LanguageKeys.Commands.Management.PermissionNodesNodeNotExists);
					expect((casted.context as { target: typeof role }).target).toBe(role);
				}
			});
		});
	});

	describe('refresh', () => {
		test('GIVEN no roles THEN returns early', () => {
			const ctx = readSettingsPermissionNodes();
			ctx.refresh(entity);

			expect(getSorted().size).toBe(0);
		});

		test('GIVEN valid roles THEN the sorted permission nodes are in correct order', () => {
			const roleDeveloper = createRole({ id: '541739191776575502', name: 'Developer', position: 27 }, guild);
			const roleModerator = createRole({ id: '637592502756704256', name: 'Moderator', position: 26 }, guild);
			const roleContributor = createRole({ id: '635547552229490708', name: 'Contributor', position: 18 }, guild);
			const roleAlumni = createRole({ id: '541743369081192451', name: 'Alumni', position: 11 }, guild);

			entity.permissionsRoles = [
				{ id: roleModerator.id, allow: ['balance'], deny: [] },
				{ id: roleAlumni.id, allow: [], deny: ['balance'] },
				{ id: roleDeveloper.id, allow: ['ping'], deny: [] },
				{ id: roleContributor.id, allow: [], deny: ['ping'] }
			];

			const ctx = readSettingsPermissionNodes();
			entity.permissionsRoles = ctx.refresh(entity);

			const sorted = [...getSorted().entries()];
			expect(sorted.length).toBe(4);
			expect(sorted[0]).toEqual([roleDeveloper.id, { allow: new Set(['ping']), deny: new Set() }]);
			expect(sorted[1]).toEqual([roleModerator.id, { allow: new Set(['balance']), deny: new Set() }]);
			expect(sorted[2]).toEqual([roleContributor.id, { allow: new Set(), deny: new Set(['ping']) }]);
			expect(sorted[3]).toEqual([roleAlumni.id, { allow: new Set(), deny: new Set(['balance']) }]);
		});
	});
});
