import { ModelStore } from '#lib/grpc';
import { Store } from '@sapphire/pieces';

Store.injectedContext.grpc = new ModelStore();

declare module '@sapphire/pieces' {
	interface PieceContextExtras {
		grpc: ModelStore;
	}
}
