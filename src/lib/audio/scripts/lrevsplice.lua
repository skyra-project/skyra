local function reverse(arr)
  if arr == nil then return arr end

  local i, j = 1, #arr
  while i < j do
    arr[i], arr[j] = arr[j], arr[i]

    i = i + 1
    j = j - 1
  end
  return arr
end

local function isnan(i)
  return i ~= i
end

local list = reverse(redis.call('lrange', KEYS[1], 0, -1))
local start = tonumber(table.remove(ARGV, 1))
local deleteCount = tonumber(table.remove(ARGV, 1))

if isnan(start) then
  return redis.error_reply('start index is not a number')
end
start = start + 1 -- convert to 1-based indexes

if start < 1 then
  start = #list + start
end

if start > #list then
  start = #list
end

-- if delete count isn't specified, delete everything from the starting index
if isnan(deleteCount) then
  deleteCount = #list
end

-- delete specified count of elements
for i = start, start + deleteCount - 1 do
  if list[start] == nil then break end
  table.remove(list, start) -- use constant index because the list is being resized as we remove
end

-- insert given elements
for i = 1, #ARGV do
  local pos = start + i - 1
  if pos > #list then table.insert(list, ARGV[i])
  else table.insert(list, pos, ARGV[i]) end
end

if #list > 0 then
  redis.call('del', KEYS[1])
  redis.call('lpush', KEYS[1], unpack(list)) -- list is inserted in reverse order
end

return list
