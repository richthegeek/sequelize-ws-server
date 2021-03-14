/// <reference types="node" />
import { Server } from 'http';
import * as SocketIO from 'socket.io';
import Watcher from './Watcher';
declare type StartArgs = {
    httpServer: Server;
    options: Record<string, any>;
    getContext?: (socket: SocketIO.Socket) => Promise<Record<string, any>>;
    watchers: Record<string, (args: object) => Watcher>;
    methods: Record<string, Function>;
};
export default function startSocketIO({ httpServer, options, getContext, watchers, methods }: StartArgs): any;
export {};
