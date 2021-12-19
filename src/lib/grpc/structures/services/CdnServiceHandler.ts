import { envParseString } from '#lib/env';
import { CdnServiceClient } from '../../generated/cdn_grpc_pb';
import * as Cdn from '../../generated/cdn_pb';
import { ClientHandler } from '../base/ClientHandler';
import { ResponseError } from '../errors';

export class CdnServiceHandler extends ClientHandler {
	public readonly client = new CdnServiceClient(envParseString('GRPC_CDN_ADDRESS'), ClientHandler.getCredentials());

	public async get(options: CdnServiceHandler.GetRequest): Promise<CdnServiceHandler.CdnFileResponse> {
		const query = new Cdn.GetRequest().setName(options.name);
		const result = await this.makeCallResult<Cdn.CdnFileResponse>((cb) => this.client.get(query, cb));
		if (!result.success) throw result.error;

		const resultValue = result.value.getResult();
		if (resultValue !== Cdn.CdnResult.OK) throw new ResponseError({ result: resultValue, content: '' });

		return {
			result: resultValue,
			content: result.value.getContent_asU8()
		};
	}

	public upsert(options: CdnServiceHandler.UpsertRequest): Promise<CdnServiceHandler.CdnResponse> {
		const query = new Cdn.UpsertRequest().setName(options.name).setContentType(options.contentType).setContent(options.content);
		return this.makeCall<CdnServiceHandler.CdnResponse>((cb) => this.client.upsert(query, cb));
	}

	public delete(options: CdnServiceHandler.DeleteRequest): Promise<CdnServiceHandler.CdnResponse> {
		const query = new Cdn.DeleteRequest().setName(options.name);
		return this.makeCall<CdnServiceHandler.CdnResponse>((cb) => this.client.delete(query, cb));
	}

	public dispose() {
		this.client.close();
	}
}

export namespace CdnServiceHandler {
	export type GetRequest = Cdn.GetRequest.AsObject;
	export type UpsertRequest = Cdn.UpsertRequest.AsObject;
	export type DeleteRequest = Cdn.DeleteRequest.AsObject;

	export type CdnResponse = Cdn.CdnResponse.AsObject;
	export type CdnFileResponse = Omit<Cdn.CdnFileResponse.AsObject, 'content'> & { content: Uint8Array };
}
