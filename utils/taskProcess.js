const moment = require("moment");

const date = time => moment(time).format("DD[/]MM[, at ]hh[:]mm[:]ss");

exports.reminder = (client, doc) => {
    const user = client.users.get(doc.user);
    if (!user) throw "User not found";
    const message = `⏲ Hey! You asked me on ${date(doc.createdAt)} to remind you:\n*${doc.content}*`;
    return user.send(message).catch((err) => { throw err; });
};
