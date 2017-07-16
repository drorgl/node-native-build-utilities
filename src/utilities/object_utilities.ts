// tslint:disable-next-line:no-var-requires
const DeepMerge = require("deep-merge");

function indexOfDeep(arr: any[], value: any): number {
	for (let i = 0; i < arr.length; i++) {
		if (JSON.stringify(arr[i]) === JSON.stringify(value)) {
			return i;
		}
	}
}

function onlyUnique(value: any, index: number, self: any) {
	return indexOfDeep(self, value) === index;
}

const deepmerge = DeepMerge((target: any, source: any) => {
	const concatenated = [].concat(target, source);
	return concatenated.filter(onlyUnique);
});

export function merge<T>(a: T, b: T): T {
	return deepmerge(a, b);
}
