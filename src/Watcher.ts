import * as EventEmitter from 'eventemitter3';
import { Model } from 'sequelize';
import * as _ from 'lodash';
import sift from 'sift';

type GenericModel = Model<any, any, any>;

export type Context = Record<any, any>;

type ConstructorArgs = {
  events?: EventEmitter;
  models?: GenericModel[];
  context?: Context;
  query?: any;
  callback?: (data: any) => any;
}

export default class Watcher {
  private events: EventEmitter;
  private models: GenericModel[];
  private context: Context;
  private query: any;

  public active: boolean = true;

  constructor (options: {
    events: EventEmitter;
    models: GenericModel[];
    context: Context;
    query: any;
  } & { [key: string]: any }) {
    Object.assign(this, options);

    this.events = options.events;
    this.models = options.models;
    this.context = options.context;
    this.query = options.query;

    this.update = this.update.bind(this);
    this.updateFromData = this.updateFromData.bind(this);
    this.models.forEach((model) => {
      this.events.on(model.name + '.save', this.updateFromData);
      this.events.on(model.name + '.destroy', this.updateFromData);
      this.events.on(model.name + '.bulkCreate', this.update);
      this.events.on(model.name + '.bulkUpdate', this.update);
      this.events.on(model.name + '.bulkDestroy', this.update);
    });

    this.update();
  }

  setContext (newContext: Context) {
    const prevSignature = this.signature();
    this.context = newContext;
    if (this.shouldUpdate(prevSignature, this.signature())) {
      this.update();
    }
  }

  setQuery (newQuery: any) {
    const prevSignature = this.signature();
    this.query = newQuery;
    if (this.shouldUpdate(prevSignature, this.signature())) {
      this.update();
    }
  }

  close () {
    this.active = false;
    this.models.forEach((model) => {
      this.events.removeListener(model.constructor.name + '.save', this.updateFromData);
      this.events.removeListener(model.constructor.name + '.destroy', this.updateFromData);
    });
  }

  signature () {
    return this.makeFilter();
  }

  shouldUpdate (previous: any, current: any) {
    return !_.isEqual(previous, current);
  }

  makeFilter () {
    return this.query;
  }

  filter (data: any): boolean {
    return sift(this.makeFilter())(data);
  }

  // this really should be overriden by the implementor
  // deduplication? if all arguments are same then it should be ok?
  fetch () {
    return this.models[0].findAll({
      where: this.makeFilter()
    });
  }

  updateFromData (newRecord: any) {
    if (this.filter(newRecord)) {
      this.update();
    }
  }

  async update () {
    this.callback(await this.fetch());
  }

  callback (data: any) {
    return;
  }
}
