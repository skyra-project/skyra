const { Event } = require('../index');
const moment = require('moment');
const chalk = require('chalk');
const { inspect } = require('util');

const clk = new chalk.constructor({ enabled: true });

module.exports = class extends Event {

    run(data, type = 'log') {
        type = type.toLowerCase();

        data = data.stack || data.message || data;
        if (typeof data === 'object' && typeof data !== 'string' && !Array.isArray(data)) data = inspect(data, { depth: 0, colors: true });
        if (Array.isArray(data)) data = data.join('\n');

        let timestamp = '';
        if (!this.client.config.disableLogTimestamps) {
            timestamp = `[${moment().format('YYYY-MM-DD HH:mm:ss')}]`;
            if (!this.client.config.disableLogColor) {
                switch (type) {
                    case 'debug':
                        timestamp = clk.bgMagenta(timestamp);
                        break;
                    case 'warn':
                        timestamp = clk.black.bgYellow(timestamp);
                        break;
                    case 'error':
                        timestamp = clk.bgRed(timestamp);
                        break;
                    case 'log':
                        timestamp = clk.bgBlue(timestamp);
                        break;
                    // no default
                }
            }
            timestamp += ' ';
        }

        if (type === 'debug') type = 'log';
        // eslint-disable-next-line no-console
        console[type](data.split('\n').map(str => timestamp + str).join('\n'));
    }

};
