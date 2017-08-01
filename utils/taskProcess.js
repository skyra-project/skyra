const moment = require('moment');

const date = time => moment(time).format('DD[/]MM[, at ]hh[:]mm[:]ss');

exports.reminder = async (client, doc) => {
    const user = await client.fetchUser(doc.user).catch((err) => { throw err; });
    const message = `⏲ Hey! You asked me on ${date(doc.createdAt)} to remind you:\n*${doc.content}*`;
    return user.send(message).catch((err) => { throw err; });
};

exports.poll = async (client, poll) => {
    const user = await client.fetchUser(poll.user).catch((err) => { throw err; });
    let content;
    if (poll.voted.length > 0) {
        const graph = [];
        const length = Object.keys(poll.votes).reduce((long, str) => Math.max(long, str.length), 0);
        for (const [key, value] of Object.entries(poll.votes)) {
            const percentage = Math.round((value / poll.voted.length) * 100);
            graph.push(`${key.padEnd(length, ' ')} : [${'#'.repeat((percentage / 100) * 25).padEnd(25, ' ')}] (${percentage}%)`);
        }
        content = `Hey! Your poll __${poll.title}__ with ID \`${poll.id}\` just finished, check the results!${'```http'}\n${graph.join('\n')}${'```'}`;
    } else {
        content = `Hey! Your poll __${poll.title}__ with ID \`${poll.id}\` just finished, but nobody voted :(`;
    }

    await user.send(content).catch(() => null);

    return client.clock.create({
        type: 'pollEnd',
        timestamp: 86400000 + new Date().getTime(),
        poll
    }).catch((err) => { throw err; });
};
