import { MemberClient } from '../generated/member_grpc_pb';
import * as Member from '../generated/member_pb';
import type * as Shared from '../generated/shared_pb';
import { ClientHandler } from './base/ClientHandler';

export class MemberHandler extends ClientHandler {
	public readonly client = new MemberClient(ClientHandler.address, ClientHandler.getCredentials());

	public getPoints(options: MemberHandler.Query): Promise<MemberHandler.ExperienceResult> {
		const query = new Member.MemberQuery().setUserId(options.userId).setGuildId(options.guildId);
		return this.makeCall<MemberHandler.ExperienceResult>((cb) => this.client.getPoints(query, cb));
	}

	public addPoints(options: MemberHandler.ExperienceQuery): Promise<MemberHandler.ExperienceResult> {
		const query = new Member.MemberQueryWithPoints().setUserId(options.userId).setGuildId(options.guildId).setAmount(options.amount);
		return this.makeCall<MemberHandler.ExperienceResult>((cb) => this.client.addPoints(query, cb));
	}

	public removePoints(options: MemberHandler.ExperienceQuery): Promise<MemberHandler.ExperienceResult> {
		const query = new Member.MemberQueryWithPoints().setUserId(options.userId).setGuildId(options.guildId).setAmount(options.amount);
		return this.makeCall<MemberHandler.ExperienceResult>((cb) => this.client.removePoints(query, cb));
	}

	public setPoints(options: MemberHandler.ExperienceQuery): Promise<MemberHandler.Result> {
		const query = new Member.MemberQueryWithPoints().setUserId(options.userId).setGuildId(options.guildId).setAmount(options.amount);
		return this.makeCall((cb) => this.client.setPoints(query, cb));
	}

	public resetPoints(options: MemberHandler.Query): Promise<MemberHandler.Result> {
		const query = new Member.MemberQuery().setUserId(options.userId).setGuildId(options.guildId);
		return this.makeCall((cb) => this.client.resetPoints(query, cb));
	}
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace MemberHandler {
	// Queries
	export type ExperienceQuery = Member.MemberQueryWithPoints.AsObject;
	export type Query = Member.MemberQuery.AsObject;

	// Results
	export type ExperienceResult = Member.ExperienceResult.AsObject;
	export type Result = Shared.Result.AsObject;
}
