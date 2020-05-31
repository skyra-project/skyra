import { IncomingMessage } from 'http';
import { Socket } from 'net';

export interface UserAuthObject {
	token: string;
	user_id: string;
}

export default class ApiRequest extends IncomingMessage {

	public constructor(socket: Socket) {
		super(socket);
	}

}

export default interface ApiRequest<T = unknown> {
	originalUrl: string;
	path: string;
	search: string;
	query: Record<string, string | string[]>;
	params: Record<string, string>;
	body?: T;
	length?: number;
	auth?: UserAuthObject;
}
