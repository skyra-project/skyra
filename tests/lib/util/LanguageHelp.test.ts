import { LanguageHelp } from '@utils/LanguageHelp';

describe('LanguageHelp builder', () => {
	const builder = new LanguageHelp()
		.setExplainedUsage('⚙ | ***Explained usage***')
		.setPossibleFormats('🔢 | ***Possible formats***')
		.setExamples('🔗 | ***Examples***')
		.setReminder('⏰ | ***Reminder***');

	test('GIVEN basic command display THEN parses correctly', () => {
		const commandHelp = builder.display('add', {
			extendedHelp: [
				`Add songs to the playing queue and prepare for musical enjoyment!
					I can play from YouTube, Bandcamp, SoundCloud, Twitch, Vimeo, or Mixer.`,
				'- To play from YouTube either give me something to search, a video link, or a playlist link.',
				'- To play from SoundCloud give me a SoundCloud link, or if you want me to search include either `--sc` or `--soundcloud` in your message.',
				"- To play from Mixer give me the URL of a Mixer streamer, I'm sorry but I cannot (yet) play Mixer VODs.",
				'- To play from Bandcamp, Twitch, or Vimeo just give me a URL to a video or playlist on those sources.'
			].join('\n'),
			explainedUsage: [['song', 'The song to queue. Can be either a URL or a video/song title.']],
			examples: [
				'The Pokémon Theme song',
				'https://youtu.be/fJ9rUzIMcZQ',
				'--sc Imagine Dragons Believer',
				'https://soundcloud.com/vladkurt/imagine-dragons-beliver-vladkurt-remix',
				'https://vimeo.com/channels/music/239029778',
				'https://mixer.com/Ninja',
				'https://thedisappointed.bandcamp.com/album/escapism-2'
			],
			multiline: true
		});

		const expectedOutput = `Add songs to the playing queue and prepare for musical enjoyment!
I can play from YouTube, Bandcamp, SoundCloud, Twitch, Vimeo, or Mixer.
- To play from YouTube either give me something to search, a video link, or a playlist link.
- To play from SoundCloud give me a SoundCloud link, or if you want me to search include either \`--sc\` or \`--soundcloud\` in your message.
- To play from Mixer give me the URL of a Mixer streamer, I'm sorry but I cannot (yet) play Mixer VODs.
- To play from Bandcamp, Twitch, or Vimeo just give me a URL to a video or playlist on those sources.

⚙ | ***Explained usage***
→ **song**: The song to queue. Can be either a URL or a video/song title.

🔗 | ***Examples***
→ Skyra, add *The Pokémon Theme song*
→ Skyra, add *https://youtu.be/fJ9rUzIMcZQ*
→ Skyra, add *--sc Imagine Dragons Believer*
→ Skyra, add *https://soundcloud.com/vladkurt/imagine-dragons-beliver-vladkurt-remix*
→ Skyra, add *https://vimeo.com/channels/music/239029778*
→ Skyra, add *https://mixer.com/Ninja*
→ Skyra, add *https://thedisappointed.bandcamp.com/album/escapism-2*
`;

		expect(commandHelp).toBe(expectedOutput);
	});

	test('GIVEN extended help w/ possible formats & w/ mutliline string & w/ reminder THEN parses correctly', () => {
		const commandHelp = builder.display('sample', {
			extendedHelp: `This is line 1
			This is line 2
			This is line 3`,
			reminder: 'Ava is trash',
			possibleFormats: [
				['Jest', 'The good stuff'],
				['Jasmine', 'The inspiration'],
				['Mocha', 'The grandfather'],
				['Ava', 'The Sham']
			],
			examples: ['']
		});

		const expectedOutput = `This is line 1 This is line 2 This is line 3

🔢 | ***Possible formats***
→ **Jest**: The good stuff
→ **Jasmine**: The inspiration
→ **Mocha**: The grandfather
→ **Ava**: The Sham

🔗 | ***Examples***
→ Skyra, sample

⏰ | ***Reminder***
Ava is trash`;

		expect(commandHelp).toBe(expectedOutput);
	});

	test('GIVEN extended help w/o extendedHelp THEN parses correctly', () => {
		const commandHelp = builder.display('sample', {
			reminder: ['This goes to 9000', 'Actually 9001'],
			multiline: true
		});

		const expectedOutput = `🔗 | ***Examples***
→ Skyra, sample

⏰ | ***Reminder***
This goes to 9000
Actually 9001`;

		expect(commandHelp).toBe(expectedOutput);
	});

	test('GIVEN extended w/ array value w/o multiline THEN parses correctly', () => {
		const commandHelp = builder.display('sample', {
			reminder: ['This goes to 9000', 'Actually 9001']
		});

		const expectedOutput = `🔗 | ***Examples***
→ Skyra, sample

⏰ | ***Reminder***
This goes to 9000 Actually 9001`;

		expect(commandHelp).toBe(expectedOutput);
	});
});
