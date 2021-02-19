import { Transformer } from '@skyra/tags';

Transformer.formatters
	.set('mockcase', (value) =>
		value
			.split(' ')
			.map((word) => [...word].map((character, index) => ((index & 1) === 0 ? character.toUpperCase() : character.toLowerCase())).join(''))
			.join(' ')
	)
	.set('length', (value) => value.length.toString());
