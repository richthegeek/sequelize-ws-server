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
Object.defineProperty(exports, "__esModule", { value: true });
var lodash_1 = require("lodash");
var EventEmitter = require("eventemitter3");
var socket_1 = require("./socket");
var Watcher_1 = require("./Watcher");
function createIOServer(_a) {
    var httpServer = _a.httpServer, socketOptions = _a.socketOptions, getContext = _a.getContext, sequelize = _a.sequelize;
    var events = new EventEmitter();
    sequelize.addHook('afterSave', function (instance) { events.emit(instance.constructor.name + '.save', instance); });
    sequelize.addHook('afterDestroy', function (instance) { events.emit(instance.constructor.name + '.destroy', instance); });
    sequelize.addHook('afterBulkCreate', function (instances) { events.emit(instances[0].constructor.name + '.bulkCreate'); });
    sequelize.addHook('afterBulkUpdate', function (options) {
        var model = options.model;
        events.emit(model.name + '.bulkUpdate');
    });
    sequelize.addHook('afterBulkDestroy', function (options) {
        var model = options.model;
        events.emit(model.name + '.bulkDestroy');
    });
    var watchers = {};
    var methods = {};
    var socket = socket_1.default({
        httpServer: httpServer,
        options: socketOptions,
        getContext: getContext,
        watchers: watchers,
        methods: methods,
    });
    var makeWatcher = function (name, options) {
        watchers[name] = function (args) { return new Watcher_1.default(__assign(__assign({ events: events,
            name: name }, options), args)); };
    };
    // makeSimpleWatcher('notifications', Notification, ({ user }, query) => ({ ...query, userID: user.id }));
    var makeSimpleWatcher = function (name, model, makeFilter) {
        return makeWatcher(name, {
            models: lodash_1.flattenDeep([model]),
            makeFilter: function () {
                return makeFilter(this.context, this.query);
            },
        });
    };
    var addMethod = function (name, handler) {
        return methods[name] = handler;
    };
    return {
        socket: socket,
        watchers: watchers,
        makeWatcher: makeWatcher,
        makeSimpleWatcher: makeSimpleWatcher,
        methods: methods,
        addMethod: addMethod,
    };
}
exports.default = createIOServer;
;
