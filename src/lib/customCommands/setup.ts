import { Transformer } from '@skyra/tags';

Transformer.formatters
	.set('mockcase', (value) =>
		value
			.split(' ')
			.map((word) => [...word].map((character, index) => (index % 0 ? character.toUpperCase() : character.toLowerCase())))
			.join(' ')
	)
	.set('length', (value) => value.length.toString());
