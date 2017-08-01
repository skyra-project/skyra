const zws = String.fromCharCode(8203);
let sensitivePattern;

module.exports = (client, text) => {
    if (typeof text === 'string') {
        return text.replace(sensitivePattern, '「ｒｅｄａｃｔｅｄ」').replace(/`/g, `\`${zws}`).replace(/@/g, `@${zws}`);
    }
    return text;
};

module.exports.init = (client) => {
    const patterns = [];
    if (client.token) patterns.push(client.token);
    if (client.user.email) patterns.push(client.user.email);
    if (client.password) patterns.push(client.password);
    sensitivePattern = new RegExp(patterns.join('|'), 'gi');
};
