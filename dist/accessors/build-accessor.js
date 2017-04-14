"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t;
    return { next: verb(0), "throw": verb(1), "return": verb(2) };
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var nativeGyp = require("./native-gyp-accessor");
var gyp = require("./node-gyp-accessor");
//execute node-gyp
//cache results of build is successful, the question is what is the key...? perhaps a hash of all the sources?
//  "binary": {
//     "module_name": "quantlib",
//     "module_path": "./build/Release/quantlib.node",
//     "host": "https://github.com",
//     "package_name": "{platform}-{arch}.tar.gz",
//     "remote_path": "./quantlibnode/quantlibnode/releases/download/v{version}/"
//   }
//   "binary": {
//       "module_name": "mymodule",
//       "module_path": "./build/",
//       "host": "https://github.com",
//       "package_name": "{platform}-{arch}.tar.gz",
//       "remote_path": "./myproject/dist/raw/master/v{version}/"
//   }
//nnbu-configure && node-gyp configure -- --no-duplicate-basename-check   && node-gyp build
//
var DEFAULT_PACKAGE_NAME = "{module_name}-v{version}-{node_abi}-{platform}-{arch}.7z";
function get_module_package_name(binary, processInfo) {
    var ret = binary.package_name || DEFAULT_PACKAGE_NAME;
    for (var _i = 0, _a = Object.getOwnPropertyNames(processInfo); _i < _a.length; _i++) {
        var key = _a[_i];
        var rep = new RegExp("{" + key + "}", "i");
        ret = ret.replace(rep, processInfo[key]);
    }
    return ret;
}
exports.get_module_package_name = get_module_package_name;
function parse_options(configure_params) {
    var node_gyp_arguments = [];
    var gyp_arguments = [];
    if (configure_params) {
        if (configure_params.startsWith("-- ")) {
            gyp_arguments = gyp_arguments.concat(configure_params.split(" "));
        }
        else {
            var ngparameters = configure_params.split(" -- ")[0];
            var node_gyp_args = (ngparameters.length > 0) ? ngparameters[0].split(" ") : [];
            var gyp_args = (ngparameters.length > 1) ? ngparameters[1].split(" ") : [];
            node_gyp_arguments = node_gyp_arguments.concat(node_gyp_args);
            gyp_arguments = gyp_arguments.concat(gyp_args);
        }
    }
    return {
        node_gyp_arguments: node_gyp_arguments,
        gyp_arguments: gyp_arguments
    };
}
function configure(additional_options) {
    return __awaiter(this, void 0, void 0, function () {
        var native_gyps, args, _i, native_gyps_1, ng, configure_params, ngargs, cmdargs, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, nativeGyp.read_all_native_gyps("./")];
                case 1:
                    native_gyps = _a.sent();
                    args = parse_options(additional_options);
                    //collect configuration options
                    for (_i = 0, native_gyps_1 = native_gyps; _i < native_gyps_1.length; _i++) {
                        ng = native_gyps_1[_i];
                        configure_params = ng.node_gyp_configure_parameters;
                        if (!configure_params) {
                            continue;
                        }
                        ngargs = parse_options(configure_params);
                        args.gyp_arguments = args.gyp_arguments.concat(ngargs.gyp_arguments);
                        args.node_gyp_arguments = args.node_gyp_arguments.concat(ngargs.node_gyp_arguments);
                    }
                    cmdargs = args.node_gyp_arguments.join(" ") + " -- " + args.gyp_arguments.join(" ");
                    return [4 /*yield*/, gyp.configure(cmdargs)];
                case 2:
                    result = _a.sent();
                    return [2 /*return*/, (result == 0)];
            }
        });
    });
}
exports.configure = configure;
function build(additional_options) {
    return __awaiter(this, void 0, void 0, function () {
        var native_gyps, args, _i, native_gyps_2, ng, configure_params, ngargs, cmdargs, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, nativeGyp.read_all_native_gyps("./")];
                case 1:
                    native_gyps = _a.sent();
                    args = parse_options(additional_options);
                    //collect build options
                    for (_i = 0, native_gyps_2 = native_gyps; _i < native_gyps_2.length; _i++) {
                        ng = native_gyps_2[_i];
                        configure_params = ng.node_gyp_build_parameters;
                        if (!configure_params) {
                            continue;
                        }
                        ngargs = parse_options(configure_params);
                        args.gyp_arguments = args.gyp_arguments.concat(ngargs.gyp_arguments);
                        args.node_gyp_arguments = args.node_gyp_arguments.concat(ngargs.node_gyp_arguments);
                    }
                    cmdargs = args.node_gyp_arguments.join(" ") + " -- " + args.gyp_arguments.join(" ");
                    return [4 /*yield*/, gyp.build(cmdargs)];
                case 2:
                    result = _a.sent();
                    return [2 /*return*/, (result == 0)];
            }
        });
    });
}
exports.build = build;
//# sourceMappingURL=build-accessor.js.map