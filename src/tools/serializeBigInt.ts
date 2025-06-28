export function serializeBigInt(obj: any): any {
	if (obj === null || obj === undefined) return obj;

	if (typeof obj === "bigint") return obj.toString();

	if (obj instanceof Date) return obj.toISOString();

	if (Array.isArray(obj)) return obj.map(serializeBigInt);

	if (typeof obj === "object") {
		const newObj: any = {};
		for (const key in obj) {
			if (Object.prototype.hasOwnProperty.call(obj, key)) {
				newObj[key] = serializeBigInt(obj[key]);
			}
		}
		return newObj;
	}

	return obj;
}
