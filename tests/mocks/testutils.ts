export function expectCalledStrict(
	mockFn: ReturnType<typeof jest.fn> | ReturnType<typeof jest.spyOn>,
	amountOfCalls = 1,
	...calledWithArgs: unknown[]
) {
	expect(mockFn).toHaveBeenCalledTimes(amountOfCalls);
	if (amountOfCalls > 0) {
		expect(mockFn).toHaveBeenCalledWith(...calledWithArgs);
	}
}

export function expectReturnedStrict(
	mockFn: ReturnType<typeof jest.fn> | ReturnType<typeof jest.spyOn>,
	amountOfReturns = 1,
	...returnedWithArgs: unknown[]
) {
	expect(mockFn).toHaveReturnedTimes(amountOfReturns);
	if (amountOfReturns > 0) {
		// @ts-expect-error Returned with args should always be provided when amount of returns is higher than 0
		expect(mockFn).toHaveReturnedWith(...returnedWithArgs);
	}
}
