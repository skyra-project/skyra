const ipc = require('node-ipc');
let instance;

module.exports = class Controller {

	constructor(client, configs) {
		/**
		 * The Client that initialized this instance
		 * @since 3.0.0
		 * @type {Skyra}
		 */
		this.client = client;

		/**
		 * The IPC client that manages this instance
		 * @since 3.0.0
		 * @type {NodeIPC.IPC}
		 */
		this.ipc = ipc;

		/**
		 * Whether the IPC controller is ready or not
		 * @since 3.0.0
		 * @type {boolean}
		 */
		this.ready = false;

		// Assign the configs
		ipc.config = Object.assign(ipc.config, configs);

		// Initialize this controller
		this.init();
	}

	/**
	 * Handle the messages from the socket
	 * @since 3.0.0
	 * @param {string} _data The data to process
	 * @param {NodeIPC.Socket} socket The socket that emitted the message
	 * @private
	 */
	async _onMessage(_data, socket) {
		const data = JSON.parse(_data);
		const { response, success } = await this.client.apiHandler.run(data);
		ipc.server.emit(socket, 'message', JSON.stringify({ id: data.id, success, response }));
	}

	/**
	 * Start the IPC server
	 * @since 3.0.0
	 * @returns {boolean}
	 * @private
	 */
	init() {
		if (this.ready) return false;

		ipc.serve(() => {
			ipc.server
				.on('message', this._onMessage.bind(this))
				.on('error', (error) => this.client.emit('error', error))
				.on('connect', () => this.client.emit('verbose', 'IPC Channel Connected'))
				.on('disconnect', () => this.client.emit('warn', 'IPC Channel Disconnected'))
				.on('destroy', () => this.client.emit('warn', 'IPC Channel Destroyed'))
				.on('socket.disconnected', (socket, destroyedSocketID) => this.client.emit('verbose', `The Socket ${destroyedSocketID} has disconnected!`));
		});

		ipc.server.start();

		return true;
	}

	/**
	 * Create a new singleton instance
	 * @since 3.0.0
	 * @param {Skyra} client The Client that manages this IPC controller
	 * @param {Object} configs The configs
	 * @returns {Controller}
	 */
	static createInstance(client, configs) {
		if (!instance) instance = new Controller(client, configs);
		return instance;
	}

};
