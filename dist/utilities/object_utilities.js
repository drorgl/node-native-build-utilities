"use strict";
exports.__esModule = true;
// tslint:disable-next-line:no-var-requires
var DeepMerge = require("deep-merge");
function indexOfDeep(arr, value) {
    for (var i = 0; i < arr.length; i++) {
        if (JSON.stringify(arr[i]) === JSON.stringify(value)) {
            return i;
        }
    }
}
function onlyUnique(value, index, self) {
    return indexOfDeep(self, value) === index;
}
var deepmerge = DeepMerge(function (target, source) {
    var concatenated = [].concat(target, source);
    return concatenated.filter(onlyUnique);
});
function merge(a, b) {
    return deepmerge(a, b);
}
exports.merge = merge;
//# sourceMappingURL=object_utilities.js.map