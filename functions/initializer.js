const clean = require("./clean");
const create = require("./create");
const dashboard = require("./dashboard");

module.exports = client => Promise.all([
    clean.init(client),
    create.init(client),
    dashboard.init(client),
]);
