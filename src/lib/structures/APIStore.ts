import { Store, util } from 'klasa';
import { NodeMessage } from 'veza';
import Skyra from '../Skyra';
import { APIResponse } from '../types/skyra';
import API from './API';
const { isObject, mergeDefault } = util;

const NOT_FOUND: APIResponse = { success: false, response: null, type: 'NO_MATCH', code: 404 };

export default class APIStore extends Store<string, API, typeof API> {

	public constructor(client: Skyra) {
		super(client, 'ipcPieces', API);
	}

	/**
	 * Run the router
	 * @since 3.0.0
	 * @param message The data to process
	 */
	public run(message: NodeMessage): Promise<APIResponse> {
		const piece: API = this.get(message.data.route);
		return piece ? this.runPiece(piece, message) : Promise.resolve(NOT_FOUND);
	}

	/**
	 * Run the piece
	 * @since 3.0.0
	 * @param piece The Piece to run
	 * @param message The data to process
	 */
	private async runPiece(piece: API, message: NodeMessage): Promise<APIResponse> {
		try {
			const result: APIResponse | null = await piece.run(message.data);
			if (result === null) return NOT_FOUND;
			if (!isObject(result)) return { success: true, response: result, type: 'SUCCESS', code: 200 };

			return mergeDefault({ success: true, response: null, type: 'SUCCESS', code: 200 }, result);
		} catch (error) {
			if (error === null) return NOT_FOUND;
			if (!isObject(error)) return { success: false, response: error, type: 'UNKNOWN', code: 403 };

			return mergeDefault({ success: false, response: null, type: 'UNKNOWN', code: 403 }, error);
		}
	}

}
