import { CommandMatcher } from '#lib/database';
import { command } from '#mocks/MockInstances';

describe('CommandMatcher', () => {
	describe('match', () => {
		test('GIVEN non-namespaced match with correct command name THEN passes test', () => {
			expect(CommandMatcher.match('ping', command)).toBe(true);
		});

		test('GIVEN non-namespaced match with correct command alias THEN passes test', () => {
			expect(CommandMatcher.match('pong', command)).toBe(true);
		});

		test('GIVEN namespaced match with correct category THEN passes test', () => {
			expect(CommandMatcher.match('General.*', command)).toBe(true);
		});

		test('GIVEN namespaced match with correct category and sub-category THEN passes test', () => {
			expect(CommandMatcher.match('General.Chat Bot Info.*', command)).toBe(true);
		});

		test('GIVEN non-namespaced match with incorrect command name THEN fails test', () => {
			expect(CommandMatcher.match('eval', command)).toBe(false);
		});

		test('GIVEN namespaced match with incorrect category THEN fails test', () => {
			expect(CommandMatcher.match('Animal.*', command)).toBe(false);
		});

		test('GIVEN namespaced match with incorrect category and correct sub-category THEN fails test', () => {
			expect(CommandMatcher.match('Admin.Chat Bot Info.*', command)).toBe(false);
		});

		test('GIVEN namespaced match with correct category and incorrect subcommand THEN fails test', () => {
			expect(CommandMatcher.match('General.General.*', command)).toBe(false);
		});

		test('GIVEN namespaced match with incorrect category and incorrect subcommand THEN fails test', () => {
			expect(CommandMatcher.match('Animal.General.*', command)).toBe(false);
		});

		test('GIVEN namespaced match with correct category, correct subcommand, and correct command name THEN passes test', () => {
			expect(CommandMatcher.match('General.Chat Bot Info.ping', command)).toBe(true);
		});

		test('GIVEN namespaced match with correct category, correct subcommand, and correct command alias THEN passes test', () => {
			expect(CommandMatcher.match('General.Chat Bot Info.pong', command)).toBe(true);
		});

		test('GIVEN namespaced match with correct category, correct subcommand, and incorrect command name THEN fails test', () => {
			expect(CommandMatcher.match('General.Chat Bot Info.eval', command)).toBe(false);
		});
	});
});
