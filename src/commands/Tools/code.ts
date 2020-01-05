import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { languages } from '@lib/util/codeLanguages';
import { Mime } from '@lib/util/constants';
import { fetch, FetchResultTypes } from '@utils/util';
import { CommandStore, KlasaMessage } from 'klasa';
import { RequestInit } from 'node-fetch';

export default class extends SkyraCommand {

	private readonly CODE_REGEX = /^```(\w+)\s(.+)```$/;

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 10,
			// TODO(gc): Add proper language key
			description: language => language.tget('COMMAND_EMOJI_DESCRIPTION'),
			// TODO(gc): Add proper language key
			extendedHelp: language => language.tget('COMMAND_EMOJI_EXTENDED'),
			usage: '<code:string>',
			flagSupport: true
		});
	}

	public async run(message: KlasaMessage, [code]: [string]) {
		const identifier = code.split('\n')[0].replace(/`/g, '');

		const regexResult = this.CODE_REGEX.exec(code);
		// TODO(gc): Add proper language key
		if (!regexResult) throw 'bruh';
		const actualCode = regexResult[2];
		// TODO(gc): Add proper language key
		if (!actualCode) throw 'bruh';

		const langObj = languages.find(lang => lang.identifier === identifier);

		// TODO(gc): Add proper language key
		if (!langObj) throw 'missing lang';

		const result = await fetch(`https://pastebin.run/api/v0/run/${langObj.implementations![0].wrappers[0].identifier}`, this.formRequestParameters(actualCode), FetchResultTypes.Result);

		if (!result.ok) {
			return message.send(await result.text());
		}

		const { stdout, stderr } = await result.json();
		// TODO(Quantum): Format result
		return message.send(stdout || stderr);
	}

	private formRequestParameters(parsedCode: string): RequestInit {
		const body = new URLSearchParams();
		body.append('compilerOptions', '');
		body.append('code', parsedCode);
		body.append('stdin', '');
		return {
			method: 'POST',
			body,
			headers: {
				'Content-Type': Mime.Types.ApplicationFormUrlEncoded
			}
		} as unknown as RequestInit;
	}

}
