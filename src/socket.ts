import { Server } from 'http';
import * as _ from 'lodash';
import * as SocketIO from 'socket.io';
import Watcher, { Context } from './Watcher';

const startSocketIOServer = require('socket.io');

type StartArgs = {
  httpServer: Server;
  options: Record<string, any>;
  getContext?: (socket: SocketIO.Socket) => Promise<Record<string, any>>;
  watchers: Record<string, (args: object) => Watcher>;
  methods: Record<string, Function>;
}

type Socket = SocketIO.Socket & { context: Context; respond: (id: string, msg: any) => any };

export default function startSocketIO ({ httpServer, options, getContext, watchers, methods }: StartArgs) {
  options = _.defaults({}, options, {
    serveClient: false,
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
    forwardErrorStack: true,
  });

  const io = startSocketIOServer(httpServer, options);

  io.use(async (socket: Socket, next: Function) => {
    if (getContext) {
      try {
        socket.context = await getContext(socket);
      } catch (err) {
        return next(err);
      }
    } else {
      socket.context = {};
    }
    next();
  });

  io.on("connection", (socket: Socket) => {
    const subscriptions = new Map<any, Watcher>();

    socket.respond = (id: string, msg: any) => {
      if (msg instanceof Error) {
        const newMsg = {
          error: msg.message,
          stack: options.forwardErrorStack && msg.stack,
        };
        socket.emit(`response.${id}`, newMsg);
      } else {
        socket.emit(`response.${id}`, msg);
      }
    };

    socket.on('subscribe', (id: string, type: string, query: any) => {
      const watcher = watchers[type];
      if (!watcher) {
        return socket.respond(id, new Error('Unknown subscription type'));
      }

      subscriptions.set(id, watcher({
        query,
        context: socket.context,
        callback: (newData: any) => {
          socket.emit('update.' + id, newData)
        }
      }));
    });

    socket.on('alter', (id, query) => {
      const subscription = subscriptions.get(id);
      if (!subscription) {
        return socket.respond(id, new Error('Unknown subscription ID'));
      }

      subscription.setQuery(query);
    });

    socket.on('alterContext', (context) => {
      socket.context = { ...socket.context, ...context };
      subscriptions.forEach((sub) => {
        sub.setContext(socket.context);
      });
    });

    socket.on('unsubscribe', (id) => {
      const subscription = subscriptions.get(id);
      if (!subscription) {
        return socket.respond(id, new Error('Unknown subscription ID'));
      }

      subscription.close();
    });

    socket.on('disconnect', () => {
      subscriptions.forEach((sub) => sub.close());
    });

    socket.on('call', async (id, name, ...args) => {
      if (!methods[name]) {
        return socket.respond(id, new Error('Unknown method'));
      }

      try {
        const result = await methods[name](socket.context, ...args);
        socket.respond(id, result);
      } catch (err) {
        socket.respond(id, err);
      }
    });

  });

  return io;
}
