import { Serializer, SerializerStore, SerializerUpdateContext } from '@klasa/settings-gateway';

export class MockStringSerializer extends Serializer {

	public constructor(store: SerializerStore, file: string[], directory: string) {
		super(store, file, directory, { name: 'string' });
	}

	public deserialize(data: unknown): string {
		return String(data);
	}

	public validate(data: unknown, { entry, language }: SerializerUpdateContext): string | null {
		const parsed = String(data);
		return Serializer.minOrMax(parsed.length, entry, language) ? parsed : null;
	}

}
