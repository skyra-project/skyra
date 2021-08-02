import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { ApplyOptions } from '@sapphire/decorators';
import type { Argument } from '@sapphire/framework';
import { send } from '@skyra/editable-commands';
import type { Message } from 'discord.js';

const horizontalOptions = ['h', 'horizontal', 'x'];
const verticalOptions = ['v', 'vertical', 'y'];

@ApplyOptions<SkyraCommand.Options>({
	description: LanguageKeys.Commands.Misc.FlipDescription,
	extendedHelp: LanguageKeys.Commands.Misc.FlipExtended,
	options: [...horizontalOptions, ...verticalOptions]
})
export class UserCommand extends SkyraCommand {
	private get boolean(): Argument<boolean> {
		return this.container.stores.get('arguments').get('boolean') as Argument<boolean>;
	}

	public async run(message: Message, args: SkyraCommand.Args) {
		const [horizontal, vertical] = await Promise.all([this.parseOption(args, horizontalOptions), this.parseOption(args, verticalOptions)]);
		if (!horizontal && !vertical) this.error(LanguageKeys.Commands.Misc.FlipDisabled);

		let chars = this.convert(await args.rest('string'));
		if (horizontal) chars = this.flipHorizontal(chars);
		if (vertical) chars = this.flipVertical(chars);

		const content = args.t(LanguageKeys.Commands.Misc.FlipOutput, { value: chars.join('') });
		return send(message, { content, allowedMentions: { users: [], roles: [] } });
	}

	private convert(content: string) {
		return [...content];
	}

	private flipHorizontal(content: string[]) {
		return content.reverse();
	}

	private flipVertical(content: string[]) {
		return content.map((char) => UserCommand.flips.get(char) ?? UserCommand.flipsFlipped.get(char) ?? char);
	}

	private async parseOption(args: SkyraCommand.Args, option: string[]) {
		const parameter = args.getOption(...option);
		if (parameter === null) return true;

		const argument = this.boolean;
		const result = await argument.run(parameter, { args, argument, command: this, commandContext: args.commandContext, message: args.message });
		if (result.success) return result.value;
		throw result.error;
	}

	private static readonly flips = new Map([
		['0', '0'],
		['1', 'Ɩ'],
		['2', 'ᄅ'],
		['3', 'Ɛ'],
		['4', 'ㄣ'],
		['5', 'ϛ'],
		['6', '9'],
		['7', 'ㄥ'],
		['8', '8'],
		['9', '6'],
		['a', 'ɐ'],
		['b', 'q'],
		['c', 'ɔ'],
		['d', 'p'],
		['e', 'ǝ'],
		['f', 'ɟ'],
		['g', 'ƃ'],
		['h', 'ɥ'],
		['i', 'ᴉ'],
		['j', 'ɾ'],
		['k', 'ʞ'],
		['m', 'ɯ'],
		['n', 'u'],
		['r', 'ɹ'],
		['t', 'ʇ'],
		['v', 'ʌ'],
		['w', 'ʍ'],
		['y', 'ʎ'],
		['A', '∀'],
		['C', 'Ɔ'],
		['E', 'Ǝ'],
		['F', 'Ⅎ'],
		['G', 'פ'],
		['H', 'H'],
		['I', 'I'],
		['J', 'ſ'],
		['L', '˥'],
		['M', 'W'],
		['N', 'N'],
		['P', 'Ԁ'],
		['T', '┴'],
		['U', '∩'],
		['V', 'Λ'],
		['Y', '⅄'],
		['.', '˙'],
		[',', "'"],
		["'", ','],
		['"', ',,'],
		['`', ','],
		['?', '¿'],
		['!', '¡'],
		['[', ']'],
		[']', '['],
		['(', ')'],
		[')', '('],
		['{', '}'],
		['}', '{'],
		['<', '>'],
		['>', '<'],
		['&', '⅋'],
		['_', '‾'],
		['∴', '∵'],
		['⁅', '⁆']
	]);

	private static readonly flipsFlipped = new Map([...this.flips.entries()].map(([key, value]) => [value, key]));
}
