"use strict";
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
exports.__esModule = true;
var _ = require("lodash");
var sift_1 = require("sift");
var Watcher = /** @class */ (function () {
    function Watcher(options) {
        var _this = this;
        this.active = true;
        Object.assign(this, options);
        this.events = options.events;
        this.models = options.models;
        this.context = options.context;
        this.query = options.query;
        this.update = this.update.bind(this);
        this.updateFromData = this.updateFromData.bind(this);
        this.models.forEach(function (model) {
            _this.events.on(model.name + '.save', _this.updateFromData);
            _this.events.on(model.name + '.destroy', _this.updateFromData);
            _this.events.on(model.name + '.bulkCreate', _this.update);
            _this.events.on(model.name + '.bulkUpdate', _this.update);
            _this.events.on(model.name + '.bulkDestroy', _this.update);
        });
        this.update();
    }
    Watcher.prototype.setContext = function (newContext) {
        var prevSignature = this.signature();
        this.context = newContext;
        if (this.shouldUpdate(prevSignature, this.signature())) {
            this.update();
        }
    };
    Watcher.prototype.setQuery = function (newQuery) {
        var prevSignature = this.signature();
        this.query = newQuery;
        if (this.shouldUpdate(prevSignature, this.signature())) {
            this.update();
        }
    };
    Watcher.prototype.close = function () {
        var _this = this;
        this.active = false;
        this.models.forEach(function (model) {
            _this.events.removeListener(model.constructor.name + '.save', _this.updateFromData);
            _this.events.removeListener(model.constructor.name + '.destroy', _this.updateFromData);
        });
    };
    Watcher.prototype.signature = function () {
        return this.makeFilter();
    };
    Watcher.prototype.shouldUpdate = function (previous, current) {
        return !_.isEqual(previous, current);
    };
    Watcher.prototype.makeFilter = function () {
        return this.query;
    };
    Watcher.prototype.filter = function (data) {
        return sift_1["default"](this.makeFilter())(data);
    };
    // this really should be overriden by the implementor
    // deduplication? if all arguments are same then it should be ok?
    Watcher.prototype.fetch = function () {
        return this.models[0].findAll({
            where: this.makeFilter()
        });
    };
    Watcher.prototype.updateFromData = function (newRecord) {
        if (this.filter(newRecord)) {
            this.update();
        }
    };
    Watcher.prototype.update = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this.callback;
                        return [4 /*yield*/, this.fetch()];
                    case 1:
                        _a.apply(this, [_b.sent()]);
                        return [2 /*return*/];
                }
            });
        });
    };
    return Watcher;
}());
exports["default"] = Watcher;
