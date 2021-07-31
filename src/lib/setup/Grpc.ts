import { ModelStore } from '#lib/grpc';
import { container } from '@sapphire/framework';

container.grpc = new ModelStore();

declare module '@sapphire/pieces' {
	interface Container {
		grpc: ModelStore;
	}
}
