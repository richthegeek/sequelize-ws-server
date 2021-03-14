/// <reference types="node" />
import { Server } from 'http';
import { Model } from 'sequelize';
import Watcher from './Watcher';
declare type GenericModel = Model<any, any, any>;
export default function createIOServer({ httpServer, socketOptions, getContext, sequelize, }: {
    httpServer: Server;
    sequelize: any;
    getContext: (socket: any) => any;
    socketOptions?: any;
}): {
    socket: any;
    watchers: Record<string, (args: object) => Watcher>;
    makeWatcher: (name: string, options: any) => void;
    makeSimpleWatcher: (name: string, model: GenericModel | GenericModel[], makeFilter: any) => void;
    methods: Record<string, Function>;
    addMethod: (name: string, handler: Function) => Function;
};
export {};
