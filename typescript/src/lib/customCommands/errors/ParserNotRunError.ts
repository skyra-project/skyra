import type { Parser } from '@skyra/tags';

export class ParserNotRunError extends TypeError {
	public readonly parser: Parser;

	public constructor(parser: Parser) {
		super('The parser has not been run yet.');
		this.parser = parser;
	}

	// eslint-disable-next-line @typescript-eslint/class-literal-property-style
	public get name() {
		return 'ParserNotRunError';
	}
}
