import { CommandMatcher } from '#lib/database';
import type { SkyraCommand } from '#lib/structures';
import { commands } from '../mocks/MockInstances.js';

describe('CommandMatcher', () => {
	const command = commands.get('ping') as SkyraCommand;
	const commandWithSubCategory = commands.get('define') as SkyraCommand;

	describe('match', () => {
		test('GIVEN match-all THEN always passes test', () => {
			expect(CommandMatcher.match('*', command)).toBe(true);
		});

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
			expect(CommandMatcher.match('Tools.Dictionary.*', commandWithSubCategory)).toBe(true);
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

		test('GIVEN namespaced match with correct category and incorrect sub-category THEN fails test', () => {
			expect(CommandMatcher.match('General.General.*', command)).toBe(false);
		});

		test('GIVEN namespaced match with incorrect category and incorrect sub-category THEN fails test', () => {
			expect(CommandMatcher.match('Animal.General.*', command)).toBe(false);
		});

		test('GIVEN namespaced match with correct category, correct sub-category, and correct command name THEN passes test', () => {
			expect(CommandMatcher.match('Tools.Dictionary.define', commandWithSubCategory)).toBe(true);
		});

		test('GIVEN namespaced match with correct category, correct sub-category, and correct command alias THEN passes test', () => {
			expect(CommandMatcher.match('Tools.Dictionary.def', commandWithSubCategory)).toBe(true);
		});

		test('GIVEN namespaced match with correct category, and incorrect command name THEN fails test', () => {
			expect(CommandMatcher.match('General.eval', command)).toBe(false);
		});
	});

	describe('resolve', () => {
		test('GIVEN empty string THEN returns null', () => {
			expect(CommandMatcher.resolve('')).toBe(null);
		});

		test('GIVEN match-all THEN returns match-all', () => {
			expect(CommandMatcher.resolve('*')).toBe('*');
		});

		test('GIVEN correct command name THEN returns command name', () => {
			expect(CommandMatcher.resolve('ping')).toBe('ping');
		});

		test('GIVEN correct command name in upper cases THEN returns command name', () => {
			expect(CommandMatcher.resolve('PING')).toBe('ping');
		});

		test('GIVEN correct command alias THEN returns command name', () => {
			expect(CommandMatcher.resolve('pong')).toBe('ping');
		});

		test('GIVEN correct command alias in upper cases THEN returns command name', () => {
			expect(CommandMatcher.resolve('PONG')).toBe('ping');
		});

		test('GIVEN incorrect command name THEN returns null', () => {
			expect(CommandMatcher.resolve('eval')).toBe(null);
		});

		test('GIVEN correct category THEN returns category', () => {
			expect(CommandMatcher.resolve('General.*')).toBe('General.*');
		});

		test('GIVEN correct category in lower cases THEN returns category', () => {
			expect(CommandMatcher.resolve('general.*')).toBe('General.*');
		});

		test('GIVEN correct category in upper cases THEN returns category', () => {
			expect(CommandMatcher.resolve('GENERAL.*')).toBe('General.*');
		});

		test('GIVEN incorrect category THEN returns null', () => {
			expect(CommandMatcher.resolve('Admin.*')).toBe(null);
		});

		test('GIVEN correct category and command name THEN returns command name', () => {
			expect(CommandMatcher.resolve('Currency.balance')).toBe('balance');
		});

		test('GIVEN correct category and command name in lower cases THEN returns command name', () => {
			expect(CommandMatcher.resolve('currency.balance')).toBe('balance');
		});

		test('GIVEN correct category and command name in upper cases THEN returns command name', () => {
			expect(CommandMatcher.resolve('CURRENCY.BALANCE')).toBe('balance');
		});

		test('GIVEN correct category and command alias THEN returns command name', () => {
			expect(CommandMatcher.resolve('Currency.bal')).toBe('balance');
		});

		test('GIVEN correct category and command alias in lower cases THEN returns command name', () => {
			expect(CommandMatcher.resolve('currency.bal')).toBe('balance');
		});

		test('GIVEN correct category and command alias in upper cases THEN returns command name', () => {
			expect(CommandMatcher.resolve('CURRENCY.BAL')).toBe('balance');
		});

		test('GIVEN correct category and correct sub-category THEN returns category and sub-category', () => {
			expect(CommandMatcher.resolve('Tools.Dictionary.*')).toBe('Tools.Dictionary.*');
		});

		test('GIVEN correct category and correct sub-category in lower cases THEN returns category and sub-category', () => {
			expect(CommandMatcher.resolve('tools.dictionary.*')).toBe('Tools.Dictionary.*');
		});

		test('GIVEN correct category and correct sub-category in upper cases THEN returns category and sub-category', () => {
			expect(CommandMatcher.resolve('TOOLS.DICTIONARY.*')).toBe('Tools.Dictionary.*');
		});

		test('GIVEN correct category and incorrect sub-category THEN returns null', () => {
			expect(CommandMatcher.resolve('Tools.NotDictionary.*')).toBe(null);
		});

		test('GIVEN correct category, correct sub-category, and correct command name THEN returns command name', () => {
			expect(CommandMatcher.resolve('Tools.Dictionary.define')).toBe('define');
		});

		test('GIVEN correct category, correct sub-category, and correct command name in lower cases THEN returns command name', () => {
			expect(CommandMatcher.resolve('tools.dictionary.define')).toBe('define');
		});

		test('GIVEN correct category, correct sub-category, and correct command name in upper cases THEN returns command name', () => {
			expect(CommandMatcher.resolve('TOOLS.DICTIONARY.DEFINE')).toBe('define');
		});

		test('GIVEN correct category, correct sub-category, and correct command alias THEN returns command name', () => {
			expect(CommandMatcher.resolve('Tools.Dictionary.def')).toBe('define');
		});

		test('GIVEN correct category, correct sub-category, and correct command alias in lower cases THEN returns command name', () => {
			expect(CommandMatcher.resolve('tools.dictionary.def')).toBe('define');
		});

		test('GIVEN correct category, correct sub-category, and correct command alias in upper cases THEN returns command name', () => {
			expect(CommandMatcher.resolve('TOOLS.DICTIONARY.DEF')).toBe('define');
		});

		test('GIVEN correct category, correct sub-category, and incorrect command name THEN returns null', () => {
			expect(CommandMatcher.resolve('Tools.Dictionary.eval')).toBe(null);
		});

		test('GIVEN string with too many parts THEN returns null', () => {
			expect(CommandMatcher.resolve('never.gonna.say.goodbye')).toBe(null);
		});
	});
});
