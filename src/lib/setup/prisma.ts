import { PrismaClient } from '@prisma/client';
import { container } from '@sapphire/framework';

container.prisma = new PrismaClient();

declare module '@sapphire/pieces' {
	interface Container {
		prisma: PrismaClient;
	}
}
