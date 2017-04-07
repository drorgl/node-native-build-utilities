// tslint:disable-next-line:no-var-requires
let DeepMerge = require("deep-merge");

function indexOfDeep(arr: any[], value: any) : number{
	for (let i = 0; i < arr.length; i++){
		if (JSON.stringify(arr[i]) === JSON.stringify(value)){
			return i;
		}
	}
}

function onlyUnique(value: any, index: number, self: any) {
	return indexOfDeep(self, value) === index;
}

let deepmerge = DeepMerge((target: any, source: any) => {
	let concatenated = [].concat(target, source);
	return concatenated.filter(onlyUnique);
});

export function merge<T>(a: T, b: T): T {
	return deepmerge(a, b);
}