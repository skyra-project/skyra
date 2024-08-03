import { PrismaClient } from '@prisma/client';
import { container } from '@sapphire/framework';

const prisma = new PrismaClient().$extends({
	name: 'extensions',
	model: {
		user: {
			async fetchModerationDirectMessageEnabled(userId: string): Promise<boolean> {
				const entry = await prisma.user.findUnique({ where: { id: userId }, select: { moderationDM: true } });
				return entry?.moderationDM ?? true;
			},
			async toggleModerationDirectMessageEnabled(userId: string): Promise<boolean> {
				const [entry] = await prisma.$queryRaw<{ moderation_dm: boolean }[]>`
					INSERT INTO public.user (id, moderation_dm)
					VALUES (${userId}, false)
					ON CONFLICT (id)
					DO UPDATE SET moderation_dm = NOT public.user.moderation_dm
					RETURNING "moderation_dm";
				`;
				return entry.moderation_dm;
			}
		},
		moderation: {
			async getGuildModerationMetadata(guildId: string): Promise<GuildModerationMetadata> {
				const [entry] = await prisma.$queryRaw<{ latest: number | null; count: bigint }[]>`
					SELECT
						MAX(case_id) as "latest",
						COUNT(*) as "count"
					FROM public.moderation
					WHERE guild_id = ${guildId};
				`;

				return { latest: entry.latest ?? 0, count: Number(entry.count) };
			}
		}
	}
});
container.prisma = prisma;

declare module '@sapphire/pieces' {
	interface Container {
		prisma: typeof prisma;
	}
}

interface GuildModerationMetadata {
	latest: number;
	count: number;
}
