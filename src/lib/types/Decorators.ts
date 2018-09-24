export function enumerable(value: boolean) {
	return function(target: any, propertyKey: string) {
		const descriptor: PropertyDescriptor = Object.getOwnPropertyDescriptor(target, propertyKey) || {};
		if (descriptor.enumerable !== value) {
			descriptor.enumerable = value;
			Object.defineProperty(target, propertyKey, descriptor);
		}
	};
}
