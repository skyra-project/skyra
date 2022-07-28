/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const { workerData } = require('worker_threads');

if (process.env.NODE_ENV === 'test') {
	require('ts-node').register();
}

require(path.resolve(workerData.path));
