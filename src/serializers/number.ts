import { Serializer } from '@lib/database';
import { ApplyOptions } from '@skyra/decorators';
import { AliasPieceOptions } from 'klasa';

@ApplyOptions<AliasPieceOptions>({
	aliases: ['integer', 'float']
})
export default class UserSerializer extends Serializer {
	public async validate(data, { entry, language }) {
		let number;
		switch (entry.type) {
			case 'integer':
				number = parseInt(data);
				if (Number.isInteger(number) && Serialier.minOrMax(number, entry, language)) return number;
				throw language.get('resolverInvalidInt', { name: entry.key });
			case 'number':
			case 'float':
				number = parseFloat(data);
				if (!isNaN(number) && Serializer.minOrMax(number, entry, language)) return number;
				throw language.get('resolverInvalidFloat', { name: entry.key });
		}
		// noop
		return null;
	}
}
