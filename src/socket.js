"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var _ = require("lodash");
var startSocketIOServer = require('socket.io');
function startSocketIO(_a) {
    var _this = this;
    var httpServer = _a.httpServer, options = _a.options, getContext = _a.getContext, watchers = _a.watchers, methods = _a.methods;
    options = _.defaults({}, options, {
        serveClient: false,
        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        },
        forwardErrorStack: true
    });
    var io = startSocketIOServer(httpServer, options);
    io.use(function (socket, next) { return __awaiter(_this, void 0, void 0, function () {
        var _a, err_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!getContext) return [3 /*break*/, 5];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    _a = socket;
                    return [4 /*yield*/, getContext(socket)];
                case 2:
                    _a.context = _b.sent();
                    return [3 /*break*/, 4];
                case 3:
                    err_1 = _b.sent();
                    return [2 /*return*/, next(err_1)];
                case 4: return [3 /*break*/, 6];
                case 5:
                    socket.context = {};
                    _b.label = 6;
                case 6:
                    next();
                    return [2 /*return*/];
            }
        });
    }); });
    io.on("connection", function (socket) {
        var subscriptions = new Map();
        socket.respond = function (id, msg) {
            if (msg instanceof Error) {
                var newMsg = {
                    error: msg.message,
                    stack: options.forwardErrorStack && msg.stack
                };
                socket.emit("response." + id, newMsg);
            }
            else {
                socket.emit("response." + id, msg);
            }
        };
        socket.on('subscribe', function (id, type, query) {
            var watcher = watchers[type];
            if (!watcher) {
                return socket.respond(id, new Error('Unknown subscription type'));
            }
            subscriptions.set(id, new watcher({
                query: query,
                context: socket.context,
                callback: function (newData) {
                    socket.emit('update.' + id, newData);
                }
            }));
        });
        socket.on('alter', function (id, query) {
            if (!subscriptions.has(id)) {
                return socket.respond(id, new Error('Unknown subscription ID'));
            }
            subscriptions.get(id).setQuery(query);
        });
        socket.on('alterContext', function (context) {
            socket.context = __assign(__assign({}, socket.context), context);
            subscriptions.forEach(function (sub) {
                sub.setContext(socket.context);
            });
        });
        socket.on('unsubscribe', function (id) {
            if (!subscriptions.has(id)) {
                return socket.respond(id, new Error('Unknown subscription ID'));
            }
            subscriptions.get(id).close();
        });
        socket.on('disconnect', function () {
            subscriptions.forEach(function (sub) { return sub.close(); });
        });
        socket.on('call', function (id, name) {
            var args = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                args[_i - 2] = arguments[_i];
            }
            return __awaiter(_this, void 0, void 0, function () {
                var result, err_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!methods[name]) {
                                return [2 /*return*/, socket.respond(id, new Error('Unknown method'))];
                            }
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, methods[name].apply(methods, __spreadArrays([socket.context], args))];
                        case 2:
                            result = _a.sent();
                            socket.respond(id, result);
                            return [3 /*break*/, 4];
                        case 3:
                            err_2 = _a.sent();
                            socket.respond(id, err_2);
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        });
    });
    return io;
}
exports["default"] = startSocketIO;
