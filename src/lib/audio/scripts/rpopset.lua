local SOURCE = KEYS[1]
local DESTINATION = KEYS[2]

local key = redis.call('rpop', SOURCE)

if key then
  redis.call('set', DESTINATION, key)
  return key
end

return nil
