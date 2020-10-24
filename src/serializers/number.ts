import { Serializer } from '@lib/database';

export default class UserSerializer extends Serializer {
	public constructor(...args) {
		super(...args, { aliases: ['integer', 'float'] });
	}

	public async validate(data, { entry, language }) {
		let number;
		switch (entry.type) {
			case 'integer':
				number = parseInt(data);
				if (Number.isInteger(number) && this.constructor.minOrMax(number, entry, language)) return number;
				throw language.get('resolverInvalidInt', { name: entry.key });
			case 'number':
			case 'float':
				number = parseFloat(data);
				if (!isNaN(number) && this.constructor.minOrMax(number, entry, language)) return number;
				throw language.get('resolverInvalidFloat', { name: entry.key });
		}
		// noop
		return null;
	}
}
