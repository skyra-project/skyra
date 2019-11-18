import { Language, SchemaEntry, Serializer } from 'klasa';

export default class extends Serializer {

	public deserialize(_: string, __: SchemaEntry, ___: Language) {
		return new Promise(() => {});
	}

	public stringify(data: string) {
		return data;
	}

}