import { Server } from 'http';
import { Sequelize, Model, UpdateOptions } from 'sequelize';
import { flatten, castArray } from 'lodash';

import * as EventEmitter from 'eventemitter3';
import startSocket from './socket';
import Watcher from './Watcher';

type GenericModel = Model<any, any, any>;

type BulkHookOptions = { model: { name: string } };

export default function createIOServer ({
  httpServer,
  socketOptions,
  getContext,
  sequelize,
}: {
  httpServer: Server;
  sequelize: any;
  getContext: (socket: any) => any;
  socketOptions?: any;
}) {
  const events = new EventEmitter();
  sequelize.addHook('afterSave', (instance: GenericModel) => { events.emit(instance.constructor.name + '.save', instance) });
  sequelize.addHook('afterDestroy', (instance: GenericModel) => { events.emit(instance.constructor.name + '.destroy', instance) });

  sequelize.addHook('afterBulkCreate', (instances: GenericModel[]) => { events.emit(instances[0].constructor.name + '.bulkCreate') });
  sequelize.addHook('afterBulkUpdate', (options: BulkHookOptions) => {
    const { model } = options;
    events.emit(model.name + '.bulkUpdate');
  });
  sequelize.addHook('afterBulkDestroy', (options: BulkHookOptions) => {
    const { model } = options;
    events.emit(model.name + '.bulkDestroy');
  });

  const watchers: Record<string, (args: object) => Watcher> = {};
  const methods: Record<string, Function> = {};

  const socket = startSocket({
    httpServer,
    options: socketOptions,
    getContext,
    watchers,
    methods,
  });

  const makeWatcher = (name: string, options: any) => {
    watchers[name] = (args: object): Watcher => new Watcher({
      events,
      name,
      ...options,
      ...args,
    });
  }

  // makeSimpleWatcher('notifications', Notification, ({ user }, query) => ({ ...query, userID: user.id }));
  const makeSimpleWatcher = (name: string, model: GenericModel | GenericModel[], makeFilter: any) =>
    makeWatcher(name, {
      models: flatten(castArray(model)),
      makeFilter: function () {
        return makeFilter(this.context, this.query)
      },
    });

  const addMethod = (name: string, handler: Function) =>
    methods[name] = handler;

  return {
    socket,
    watchers,
    makeWatcher,
    makeSimpleWatcher,
    methods,
    addMethod,
  };
};
