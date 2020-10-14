redis.call('del', KEYS[1])
return redis.call('lpush', KEYS[1], unpack(ARGV))
