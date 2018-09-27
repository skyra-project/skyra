export function enumerable(value: boolean): (target: any, propertyKey: string) => void {
	return function(target: any, propertyKey: string): void {
		const descriptor: PropertyDescriptor = Object.getOwnPropertyDescriptor(target, propertyKey) || {};
		if (descriptor.enumerable !== value) {
			descriptor.enumerable = value;
			Object.defineProperty(target, propertyKey, descriptor);
		}
	};
}
