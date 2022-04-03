import { LanguageHelp } from '#lib/i18n/LanguageHelp';

describe('LanguageHelp builder', () => {
	const builder = new LanguageHelp()
		.setAliases('🖇️ | **Aliases**')
		.setUsages('📝 | **Command Usage**')
		.setExtendedHelp('🔍 | **Extended Help**')
		.setExplainedUsage('⚙ | **Explained usage**')
		.setPossibleFormats('🔢 | **Possible formats**')
		.setExamples('🔗 | **Examples**')
		.setReminder('⏰ | **Reminder**');

	test('GIVEN basic command display THEN parses correctly', () => {
		const commandHelp = builder.display(
			'coinflip',
			null,
			{
				usages: ['heads/tails', 'heads cashless', 'tails Wager'],
				extendedHelp:
					"Flip a coin. If you guess the side that shows up, you get back your wager, doubled.\nIf you don't, you lose your wager.\nYou can also run a cashless flip, which doesn't cost anything, but also doesn't reward you with anything.\nNow get those coins flippin'.",
				explainedUsage: [
					['heads/tails', 'Whether you think the coin will lands heads or tails up.'],
					[
						'cashless, Wager',
						'If cashless (default) then you do not input shinies for the coinflip (useful for RPG games or making decision). You can also put a wager of shinies here to gamble them.'
					]
				],
				examples: ['tails', 'heads 50', 'tails 200', 'tails cashless']
			},
			's!'
		);

		const expectedOutput = `📝 | **Command Usage**
→ s!coinflip *heads/tails*
→ s!coinflip *heads cashless*
→ s!coinflip *tails Wager*

🔍 | **Extended Help**
Flip a coin. If you guess the side that shows up, you get back your wager, doubled.
If you don't, you lose your wager.
You can also run a cashless flip, which doesn't cost anything, but also doesn't reward you with anything.
Now get those coins flippin'.

⚙ | **Explained usage**
→ **heads/tails**: Whether you think the coin will lands heads or tails up.
→ **cashless, Wager**: If cashless (default) then you do not input shinies for the coinflip (useful for RPG games or making decision). You can also put a wager of shinies here to gamble them.

🔗 | **Examples**
→ s!coinflip *tails*
→ s!coinflip *heads 50*
→ s!coinflip *tails 200*
→ s!coinflip *tails cashless*
`;

		expect(commandHelp).toBe(expectedOutput);
	});

	test('GIVEN extended help w/o extendedHelp THEN parses correctly', () => {
		const commandHelp = builder.display(
			'sample',
			null,
			{
				reminder: ['This goes to 9000', 'Actually 9001'].join('\n')
			},
			's!'
		);

		const expectedOutput = `🔗 | **Examples**
→ s!sample

⏰ | **Reminder**
This goes to 9000
Actually 9001`;

		expect(commandHelp).toBe(expectedOutput);
	});
});
