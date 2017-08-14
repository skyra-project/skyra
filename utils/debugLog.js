const moment = require('moment');
const chalk = require('chalk');
const clk = new chalk.constructor({ enabled: true });

class Debug {

    static log(data) {
        console.log(`${clk.bgMagenta(`[${moment().format('YYYY-MM-DD HH:mm:ss')}]`)} ${data}`);
    }

}

module.exports = Debug;
