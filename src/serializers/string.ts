import { Serializer } from '@lib/database';

export default class UserSerializer extends Serializer {
	public async validate(data, { entry, language }) {
		const string = String(data);
		return Serializer.minOrMax(string.length, entry, language) && string;
	}
}
