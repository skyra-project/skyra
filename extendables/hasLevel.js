const checkPerms = require('../functions/checkPerms');

exports.conf = {
    type: 'method',
    method: 'hasLevel',
    appliesTo: ['Message']
};

// eslint-disable-next-line func-names
exports.extend = function (min) {
    return !!checkPerms(this.client, this, min);
};
