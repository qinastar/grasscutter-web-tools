import { message } from 'antd';
import { isFunction } from 'lodash';

window.GCServerConnState = 0;  // 0 - closed; 1 - connecting; 2 - connected

export class GCManagerClient {
  constructor() {
    this.socket = null;
    this.connState = 0;  // 0 - closed; 1 - connecting; 2 - connected
    this.eventListener = [];
    this.cmdMessageHistory = [];
  }

  emitEvent(type, data) {
    this.eventListener.forEach((item) => {
      if (item && isFunction(item.handler)) {
        item.handler(type, data);
      }
    });
  }

  messageHandler(eventName, data) {
    switch (eventName) {
      case 'cmd_msg':
        this.cmdMessageHistory.push(data);  // 记录一下历史控制台消息
        this.emitEvent('message', eventName, data);
        break;
      case 'tick': // 心跳信息，单独发消息，并且不触发message事件
        this.emitEvent('tick', eventName, data);
        break;
      default:
        this.emitEvent('message', eventName, data);  // 其他的event直接丢回去
    }
  }

  connect(wssUrl, successCallback) {
    if (this.socket) {
      this.socket.close();
    }

    this.socket = new WebSocket(wssUrl);
    this.connState = 1;

    this.socket.onmessage = (resp) => {
      // console.log('[WS]收到消息:', data);
      try {
        const info = JSON.parse(resp.data);
        this.messageHandler(info?.eventName, info?.data);
      } catch (e) {
        console.error('[WS]收到消息，但解析失败:', data);
      }
    };

    this.socket.onopen = () => {
      this.connState = 2;
      this.emitEvent('connect');   // 连接成功事件
      successCallback && successCallback();
      console.log('[WS]连接成功!');
      message.success('[WS]连接成功!');
    };

    this.socket.onclose = () => {
      this.connState = 0;
      this.emitEvent('disconnect');   // 断线事件
      console.log('[WS]连接中断!');
      message.info('[WS]连接中断!');
    };

    this.socket.onerror = () => {
      this.connState = 0;
      this.emitEvent('disconnect'); // 断线事件

      console.error('[WS]连接失败，等待5秒后重新连接...');
      message.error('[WS]连接失败，等待5秒后重新连接...');

      setTimeout(() => {
        this.connect(wssUrl);
      }, 5000);
    };
  }

  sendCMD(data) {
    if (!data) return;
    this.socket.send(JSON.stringify({
      type: 'CMD', data,
    }));
  }

  getSystemStatus() {
    this.socket.send(JSON.stringify({
      type: 'State', data: 0,
    }));
  }

  getPlayerStatus() {
    this.socket.send(JSON.stringify({
      type: 'Player', data: 0,
    }));
  }

  close() {
    if (this.socket) {
      this.socket.close();
    }
  }

  subscribe(key, handler) {
    if (!key) throw new Error('key must be a string');
    if (!handler || !isFunction(handler)) throw new Error('handler must be a function');
    this.eventListener.push({ key, handler });
  }

  unsubscribe(key) {
    if (!key) throw new Error('key must be a string');
    this.eventListener = this.eventListener.filter((item) => item.key === key);
  }
}

window.GCManageClient = new GCManagerClient();
