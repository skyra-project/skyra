import { isObject } from '@klasa/utils';
import { ApiRequest } from '@lib/structures/api/ApiRequest';
import { ApiResponse } from '@lib/structures/api/ApiResponse';
import { createFunctionInhibitor } from '@skyra/decorators';
import { createHmac } from 'crypto';

export function hubSignature(secret: string) {
	return createFunctionInhibitor(
		(request: ApiRequest, response: ApiResponse) => {
			if (!isObject(request.body)) {
				response.badRequest('Malformed data received');
				return false;
			}

			const xHubSignature = request.headers['x-hub-signature'];
			if (typeof xHubSignature === 'undefined') {
				response.badRequest('Missing "x-hub-signature" header');
				return false;
			}

			const [algo, sig] = xHubSignature.toString().split('=', 2);
			if (!checkSig(algo, sig, secret, request.body)) {
				response.forbidden('Invalid Hub signature');
				return false;
			}

			return true;
		},
		(_request: ApiRequest, response: ApiResponse) => {
			response.badRequest('x-hub-signature');
		}
	);
}

export function checkSig(algorithm: string, signature: string, secret: string, data: any) {
	const hash = createHmac(algorithm, secret)
		.update(JSON.stringify(data))
		.digest('hex');

	return hash === signature;
}
