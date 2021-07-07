import { GuildEntity } from '#lib/database';
import { createGuild } from '#mocks/MockInstances';
import type { Guild } from 'discord.js';

describe('PermissionNodeManager', () => {
	let guild: Guild;
	let entity: GuildEntity;

	beforeEach(() => {
		guild = createGuild();
		entity = new GuildEntity();
		entity.id = guild.id;
	});

	describe('run', () => {
		// TODO
	});

	describe('has', () => {
		test('GIVEN a guild with no roles THEN returns false', () => {
			expect(entity.permissionNodes.has('1')).toBe(false);
		});
	});

	describe('add', () => {
		describe('user', () => {
			// TODO
		});

		describe('member', () => {
			// TODO
		});

		describe('role', () => {
			// TODO
		});
	});

	describe('remove', () => {
		describe('user', () => {
			// TODO
		});

		describe('member', () => {
			// TODO
		});

		describe('role', () => {
			// TODO
		});
	});

	describe('reset', () => {
		describe('user', () => {
			// TODO
		});

		describe('member', () => {
			// TODO
		});

		describe('role', () => {
			// TODO
		});
	});

	describe('refresh', () => {
		// TODO
	});
});
