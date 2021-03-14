/// <reference types="bluebird" />
import * as EventEmitter from 'eventemitter3';
import { Model } from 'sequelize';
declare type GenericModel = Model<any, any, any>;
export declare type Context = Record<any, any>;
export default class Watcher {
    private events;
    private models;
    private context;
    private query;
    active: boolean;
    constructor(options: {
        events: EventEmitter;
        models: GenericModel[];
        context: Context;
        query: any;
    } & {
        [key: string]: any;
    });
    setContext(newContext: Context): void;
    setQuery(newQuery: any): void;
    close(): void;
    signature(): any;
    shouldUpdate(previous: any, current: any): boolean;
    makeFilter(): any;
    filter(data: any): boolean;
    fetch(): import("bluebird")<any[]>;
    updateFromData(newRecord: any): void;
    update(): Promise<void>;
    callback(data: any): void;
}
export {};
