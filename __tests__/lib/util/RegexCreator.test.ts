import { create, processWordBoundaries, processWordPattern, processLetter, WordBoundary } from '@utils/Security/RegexCreator';

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
