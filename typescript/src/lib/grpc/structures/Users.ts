import { UserClient } from '../generated/user_grpc_pb';
import * as User from '../generated/user_pb';
import * as Shared from '../generated/shared_pb';
import { ClientHandler } from './base/ClientHandler';

export class UserHandler extends ClientHandler {
	public readonly client = new UserClient(ClientHandler.address, ClientHandler.getCredentials());

	public getPoints(options: UserHandler.Query): Promise<UserHandler.PointsResult> {
		const query = new User.UserQuery().setId(options.id);
		return this.makeCall<UserHandler.PointsResult>((cb) => this.client.getPoints(query, cb));
	}

	public addPoints(options: UserHandler.PointsQuery): Promise<UserHandler.PointsResult> {
		const query = new User.UserPointsQuery().setId(options.id).setAmount(options.amount);
		return this.makeCall<UserHandler.PointsResult>((cb) => this.client.addPoints(query, cb));
	}

	public removePoints(options: UserHandler.PointsQuery): Promise<UserHandler.PointsResult> {
		const query = new User.UserPointsQuery().setId(options.id).setAmount(options.amount);
		return this.makeCall<UserHandler.PointsResult>((cb) => this.client.removePoints(query, cb));
	}

	public resetPoints(options: UserHandler.Query): Promise<UserHandler.Result> {
		const query = new User.UserQuery().setId(options.id);
		return this.makeCall((cb) => this.client.resetPoints(query, cb));
	}

	public addMoney(options: UserHandler.MoneyQuery): Promise<UserHandler.MoneyResult> {
		const query = new User.UserMoneyQuery().setId(options.id);
		return this.makeCall((cb) => this.client.addMoney(query, cb));
	}

	public removeMoney(options: UserHandler.MoneyQuery): Promise<UserHandler.MoneyResult> {
		const query = new User.UserMoneyQuery().setId(options.id);
		return this.makeCall((cb) => this.client.removeMoney(query, cb));
	}

	public getMoney(options: UserHandler.Query): Promise<UserHandler.MoneyResult> {
		const query = new User.UserQuery().setId(options.id);
		return this.makeCall((cb) => this.client.getMoney(query, cb));
	}

	public resetMoney(options: UserHandler.Query): Promise<UserHandler.Result> {
		const query = new User.UserQuery().setId(options.id);
		return this.makeCall((cb) => this.client.resetMoney(query, cb));
	}

	public giveMoney(options: UserHandler.MoneyTransferQuery): Promise<UserHandler.MoneyTransferResult> {
		const query = new User.UserMoneyTransferQuery().setAuthorId(options.authorId).setTargetId(options.targetId).setAmount(options.amount);
		return this.makeCall((cb) => this.client.giveMoney(query, cb));
	}

	public claimDaily(options: UserHandler.DailyQuery): Promise<UserHandler.RemainingResult> {
		const query = new User.UserDailyQuery().setAuthorId(options.authorId).setForce(options.force);
		return this.makeCall((cb) => this.client.claimDaily(query, cb));
	}

	public giveReputation(options: UserHandler.TargetQuery): Promise<UserHandler.RemainingResult> {
		const query = new User.UserTargetQuery().setAuthorId(options.authorId).setTargetId(options.targetId);
		return this.makeCall((cb) => this.client.giveReputation(query, cb));
	}

	public getLargeBanner(options: UserHandler.Query): Promise<UserHandler.BannerResult> {
		const query = new User.UserQuery().setId(options.id);
		return this.makeCall((cb) => this.client.getLargeBanner(query, cb));
	}

	public getLargeBanners(options: UserHandler.Query): Promise<UserHandler.BannersResult> {
		const query = new User.UserQuery().setId(options.id);
		return this.makeCall((cb) => this.client.getLargeBanners(query, cb));
	}

	public setLargeBanner(options: UserHandler.SetBannerQuery): Promise<UserHandler.Result> {
		const query = new User.UserSetBannerQuery().setId(options.id).setBannerId(options.bannerId);
		return this.makeCall((cb) => this.client.setLargeBanner(query, cb));
	}

	public getSmallBanner(options: UserHandler.Query): Promise<UserHandler.BannerResult> {
		const query = new User.UserQuery().setId(options.id);
		return this.makeCall((cb) => this.client.getSmallBanner(query, cb));
	}

	public getSmallBanners(options: UserHandler.Query): Promise<UserHandler.BannersResult> {
		const query = new User.UserQuery().setId(options.id);
		return this.makeCall((cb) => this.client.getSmallBanners(query, cb));
	}

	public setSmallBanner(options: UserHandler.SetBannerQuery): Promise<UserHandler.Result> {
		const query = new User.UserSetBannerQuery().setId(options.id).setBannerId(options.bannerId);
		return this.makeCall((cb) => this.client.setSmallBanner(query, cb));
	}

	public getBadges(options: UserHandler.Query): Promise<UserHandler.BadgesResult> {
		const query = new User.UserQuery().setId(options.id);
		return this.makeCall((cb) => this.client.getBadges(query, cb));
	}

	public setBadges(options: UserHandler.SetBadgesQuery): Promise<UserHandler.Result> {
		const query = new User.UserSetBadgesQuery().setId(options.id).setBadgeIdsList(options.badgeIdsList);
		return this.makeCall((cb) => this.client.setBadges(query, cb));
	}

	public getColor(options: UserHandler.Query): Promise<UserHandler.ColorResult> {
		const query = new User.UserQuery().setId(options.id);
		return this.makeCall((cb) => this.client.getColor(query, cb));
	}

	public getProfile(options: UserHandler.Query): Promise<UserHandler.ProfileResult> {
		const query = new User.UserQuery().setId(options.id);
		return this.makeCall((cb) => this.client.getProfile(query, cb));
	}

	public getSpouses(options: UserHandler.Query): Promise<UserHandler.SpousesResult> {
		const query = new User.UserQuery().setId(options.id);
		return this.makeCall((cb) => this.client.getSpouses(query, cb));
	}

	public addSpouse(options: UserHandler.TargetQuery): Promise<UserHandler.Result> {
		const query = new User.UserTargetQuery().setAuthorId(options.authorId).setTargetId(options.targetId);
		return this.makeCall((cb) => this.client.addSpouse(query, cb));
	}

	public removeSpouse(options: UserHandler.TargetQuery): Promise<UserHandler.Result> {
		const query = new User.UserTargetQuery().setAuthorId(options.authorId).setTargetId(options.targetId);
		return this.makeCall((cb) => this.client.removeSpouse(query, cb));
	}

	public getGameIntegration(options: UserHandler.GameIntegrationQuery): Promise<UserHandler.GameIntegrationResult> {
		const query = new User.UserGameIntegrationQuery().setId(options.id).setGame(options.game);
		return this.makeCall((cb) => this.client.getGameIntegration(query, cb));
	}

	public addGameIntegration(options: UserHandler.AddGameIntegrationQuery): Promise<UserHandler.Result> {
		const query = new User.UserAddGameIntegrationQuery().setId(options.id).setGame(options.game).setData(options.data);
		return this.makeCall((cb) => this.client.addGameIntegration(query, cb));
	}

	public removeGameIntegration(options: UserHandler.GameIntegrationQuery): Promise<UserHandler.Result> {
		const query = new User.UserGameIntegrationQuery().setId(options.id).setGame(options.game);
		return this.makeCall((cb) => this.client.removeGameIntegration(query, cb));
	}

	public delete(options: UserHandler.Query): Promise<UserHandler.Result> {
		const query = new User.UserQuery().setId(options.id);
		return this.makeCall((cb) => this.client.delete(query, cb));
	}
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace UserHandler {
	// Queries
	export type AddGameIntegrationQuery = User.UserAddGameIntegrationQuery.AsObject;
	export type DailyQuery = User.UserDailyQuery.AsObject;
	export type GameIntegrationQuery = User.UserGameIntegrationQuery.AsObject;
	export type MoneyQuery = User.UserMoneyQuery.AsObject;
	export type MoneyTransferQuery = User.UserMoneyTransferQuery.AsObject;
	export type PointsQuery = User.UserPointsQuery.AsObject;
	export type Query = User.UserQuery.AsObject;
	export type SetBadgesQuery = User.UserSetBadgesQuery.AsObject;
	export type SetBannerQuery = User.UserSetBannerQuery.AsObject;
	export type TargetQuery = User.UserTargetQuery.AsObject;

	// Results
	export type BadgesResult = User.UserBadgesResult.AsObject;
	export type BannerResult = User.UserBannerResult.AsObject;
	export type BannersResult = User.UserBannersResult.AsObject;
	export type ColorResult = User.UserColorResult.AsObject;
	export type GameIntegrationResult = User.UserGameIntegrationResult.AsObject;
	export type MoneyResult = User.UserMoneyResult.AsObject;
	export type MoneyTransferResult = User.UserMoneyTransferResult.AsObject;
	export type PointsResult = User.UserPointsResult.AsObject;
	export type ProfileResult = User.UserProfileResult.AsObject;
	export type RemainingResult = User.UserRemainingResult.AsObject;
	export type Result = Shared.Result.AsObject;
	export type SpousesResult = User.UserSpousesResult.AsObject;
}
