import {
	create,
	processGroup,
	processLetter,
	processWordBoundaries,
	processWordPattern,
	processWordPatternsWithGroups,
	WordBoundary
} from '#utils/Security/RegexCreator';

describe('RegexCreator', () => {
	describe('processLetter', () => {
		test('GIVEN a THEN returns a', () => {
			expect(processLetter('a')).toStrictEqual('a');
		});

		test('GIVEN / THEN returns \\/', () => {
			expect(processLetter('/')).toStrictEqual('\\/');
		});
	});

	describe('processWordPattern', () => {
		test('GIVEN a THEN returns a+', () => {
			expect(processWordPattern('a')).toStrictEqual('a+');
		});

		test('GIVEN ab THEN returns a+\\W*b+', () => {
			expect(processWordPattern('ab')).toStrictEqual('a+\\W*b+');
		});

		test('GIVEN / THEN returns \\/+', () => {
			expect(processWordPattern('/')).toStrictEqual('\\/+');
		});

		test('GIVEN /b THEN returns \\/+\\W*b+', () => {
			expect(processWordPattern('/b')).toStrictEqual('\\/+\\W*b+');
		});
	});

	describe('processGroup', () => {
		test('GIVEN a THEN returns a', () => {
			expect(processGroup('a')).toStrictEqual('[a]');
		});

		test('GIVEN a-b THEN returns [a-b]', () => {
			expect(processGroup('a-b')).toStrictEqual('[a-b]');
		});

		test('GIVEN -b THEN returns [\\-b]', () => {
			expect(processGroup('-b')).toStrictEqual('[\\-b]');
		});

		test('GIVEN b- THEN returns [b\\-]', () => {
			expect(processGroup('b-')).toStrictEqual('[b\\-]');
		});

		test('GIVEN --- THEN return \\-', () => {
			expect(processGroup('---')).toStrictEqual('[\\-]');
		});

		test('GIVEN a-b-z THEN return [a-b\\-z]', () => {
			expect(processGroup('a-b-z')).toStrictEqual('[a-b\\-z]');
		});

		test('GIVEN ?a THEN return [\\?a]', () => {
			expect(processGroup('?a')).toStrictEqual('[\\?a]');
		});

		test('GIVEN ?:a THEN return [\\?:a]', () => {
			expect(processGroup('?:a')).toStrictEqual('[\\?:a]');
		});

		test('GIVEN ?:*a-b-z0-9. THEN return [\\?:\\*a-b\\-z0-9\\.]', () => {
			expect(processGroup('?:*a-b-z0-9.')).toStrictEqual('[\\?:\\*a-b\\-z0-9\\.]');
		});

		test('GIVEN ?=*a-b-z0-9. THEN return [\\?=\\*a-b\\-z0-9\\.]', () => {
			expect(processGroup('?=*a-b-z0-9.')).toStrictEqual('[\\?=\\*a-b\\-z0-9\\.]');
		});

		test('GIVEN ?!*a-b-z0-9. THEN return [\\?!\\*a-b\\-z0-9\\.]', () => {
			expect(processGroup('?!*a-b-z0-9.')).toStrictEqual('[\\?!\\*a-b\\-z0-9\\.]');
		});

		test('GIVEN ^?:*a-b-z0-9{0,2}.*$ THEN return [\\^\\?:\\*a-b\\-z0-9\\{0,2\\}\\.\\*\\$]', () => {
			expect(processGroup('^?:*a-b-z0-9{0,2}.*$')).toStrictEqual('[\\^\\?:\\*a-b\\-z0-9\\{0,2\\}\\.\\*\\$]');
		});
	});

	describe('processWordPatternsWithGroups', () => {
		test('GIVEN a THEN returns a+', () => {
			expect(processWordPatternsWithGroups('a')).toStrictEqual('a+');
		});

		test('GIVEN ab THEN returns a+\\W*b+', () => {
			expect(processWordPatternsWithGroups('ab')).toStrictEqual('a+\\W*b+');
		});

		test('GIVEN [a-b] THEN returns [a-b]+', () => {
			expect(processWordPatternsWithGroups('[a-b]')).toStrictEqual('[a-b]+');
		});

		test('GIVEN / THEN returns \\/+', () => {
			expect(processWordPatternsWithGroups('/')).toStrictEqual('\\/+');
		});

		test('GIVEN /b THEN returns \\/+\\W*b+', () => {
			expect(processWordPatternsWithGroups('/b')).toStrictEqual('\\/+\\W*b+');
		});

		test('GIVEN [a-b]c THEN returns [a-b]+\\W*c+', () => {
			expect(processWordPatternsWithGroups('[a-b]c')).toStrictEqual('[a-b]+\\W*c+');
		});

		test('GIVEN a[b-c]d[ef]g THEN returns a+\\W*[b-c]+\\W*d+\\W*[ef]+\\W*g+', () => {
			expect(processWordPatternsWithGroups('a[b-c]d[ef]g')).toStrictEqual('a+\\W*[b-c]+\\W*d+\\W*[ef]+\\W*g+');
		});

		test('GIVEN [ab][c-e][]] THEN returns [ab]+\\W*[c-e]+\\W*\\[+\\W*\\]+\\W*\\]+', () => {
			expect(processWordPatternsWithGroups('[ab][c-e][]]')).toStrictEqual('[ab]+\\W*[c-e]+\\W*\\[+\\W*\\]+\\W*\\]+');
		});
	});

	describe('processWordBoundaries', () => {
		test('GIVEN a THEN returns WordBoundary.None', () => {
			expect(processWordBoundaries('a')).toStrictEqual(WordBoundary.None);
		});

		test('GIVEN a* THEN returns WordBoundary.End', () => {
			expect(processWordBoundaries('a*')).toStrictEqual(WordBoundary.End);
		});

		test('GIVEN *a THEN returns WordBoundary.Start', () => {
			expect(processWordBoundaries('*a')).toStrictEqual(WordBoundary.Start);
		});

		test('GIVEN *a* THEN returns WordBoundary.Both', () => {
			expect(processWordBoundaries('*a*')).toStrictEqual(WordBoundary.Both);
		});

		test('GIVEN a*a THEN returns WordBoundary.None', () => {
			expect(processWordBoundaries('a*a')).toStrictEqual(WordBoundary.None);
		});
	});

	describe('create', () => {
		test("GIVEN ['a'] THEN returns (?<=^|\\W)(?:a+)(?=$|\\W)", () => {
			expect(create(['a'])).toStrictEqual('(?<=^|\\W)(?:a+)(?=$|\\W)');
		});

		test("GIVEN ['a', 'b'] THEN returns (?<=^|\\W)(?:a+|b+)(?=$|\\W)", () => {
			expect(create(['a', 'b'])).toStrictEqual('(?<=^|\\W)(?:a+|b+)(?=$|\\W)');
		});

		test("GIVEN ['[a-b]c', 'd'] THEN returns (?<=^|\\W)(?:[a-b]+\\W*c+|d+)(?=$|\\W)", () => {
			expect(create(['[a-b]c', 'd'])).toStrictEqual('(?<=^|\\W)(?:[a-b]+\\W*c+|d+)(?=$|\\W)');
		});

		test("GIVEN ['a[b-c]d[ef]g'] THEN returns (?<=^|\\W)(?:a+\\W*[b-c]+\\W*d+\\W*[ef]+\\W*g+)(?=$|\\W)", () => {
			expect(create(['a[b-c]d[ef]g'])).toStrictEqual('(?<=^|\\W)(?:a+\\W*[b-c]+\\W*d+\\W*[ef]+\\W*g+)(?=$|\\W)');
		});

		test("GIVEN ['a', '*b'] THEN returns (?<=^|\\W)(?:a+)(?=$|\\W)|(?:b+)(?=$|\\W)", () => {
			expect(create(['a', '*b'])).toStrictEqual('(?<=^|\\W)(?:a+)(?=$|\\W)|(?:b+)(?=$|\\W)');
		});

		test("GIVEN ['a', 'b*'] THEN returns (?<=^|\\W)(?:a+)(?=$|\\W)|(?<=^|\\W)(?:b+)", () => {
			expect(create(['a', 'b*'])).toStrictEqual('(?<=^|\\W)(?:a+)(?=$|\\W)|(?<=^|\\W)(?:b+)');
		});

		test("GIVEN ['a', '*b*'] THEN returns (?<=^|\\W)(?:a+)(?=$|\\W)|(?:b+)", () => {
			expect(create(['a', '*b*'])).toStrictEqual('(?<=^|\\W)(?:a+)(?=$|\\W)|(?:b+)');
		});

		test("GIVEN ['a', '*b*', 'c'] THEN returns (?<=^|\\W)(?:a+|c+)(?=$|\\W)|(?:b+)", () => {
			expect(create(['a', '*b*', 'c'])).toStrictEqual('(?<=^|\\W)(?:a+|c+)(?=$|\\W)|(?:b+)');
		});

		test("GIVEN ['http://*'] THEN returns (?<=^|\\W)(?:h+\\W*t+\\W*t+\\W*p+\\W*:+\\W*\\/+\\W*\\/+)", () => {
			expect(create(['http://*'])).toStrictEqual('(?<=^|\\W)(?:h+\\W*t+\\W*t+\\W*p+\\W*:+\\W*\\/+\\W*\\/+)');
		});
	});
});
