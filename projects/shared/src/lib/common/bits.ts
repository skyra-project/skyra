export function bitHas<T extends number | bigint>(value: T, bit: T) {
	return (value & bit) === bit;
}
