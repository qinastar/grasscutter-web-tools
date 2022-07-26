import { message } from 'antd';
import { isFunction, noop } from 'lodash';
import dayjs from 'dayjs';

window.GCServerConnState = 0;  // 0 - closed; 1 - connecting; 2 - connected

const DEFAULT_RETRY_TIMES = 3;

export class GCManagerClient {
  constructor() {
    this.socket = null;
    this.isError = false;
    this.retryWorker = null;
    this.errorRetryTimes = DEFAULT_RETRY_TIMES;
    this.connState = 0;  // 0 - closed; 1 - connecting; 2 - connected
    this.eventListener = [];
    this.cmdMessageHistory = [];
  }

  emitEvent(type, eventName, data) {
    this.eventListener.forEach((item) => {
      if (item && isFunction(item.handler)) {
        item.handler(type, eventName, data);
      }
    });
  }

  isConnecting() {
    return this.connState === 1;
  }

  isConnected() {
    return this.connState === 2;
  }

  messageHandler(eventName, data) {
    switch (eventName) {
      case 'cmd_msg': {
        const customMsg = `[${dayjs().format('HH:mm:ss')}] ${data}`;
        this.cmdMessageHistory.push(customMsg);  // 记录一下历史控制台消息
        this.emitEvent('message', eventName, customMsg);
        break;
      }
      case 'tick': // 心跳信息，单独发消息，并且不触发message事件
        this.emitEvent('tick', eventName, data);
        break;
      default:
        this.emitEvent('message', eventName, data);  // 其他的event直接丢回去
    }
  }

  connect(wssUrl, successCallback, isAutoRetry = false) {
    if (!isAutoRetry && this.socket) {
      this.socket.close();
    }
    if (!isAutoRetry) this.errorRetryTimes = DEFAULT_RETRY_TIMES;

    this.isError = false;
    this.socket = new WebSocket(wssUrl);
    this.connState = 1;

    this.socket.onmessage = (resp) => {
      // console.log('[WS]收到消息:', data);
      try {
        const info = JSON.parse(resp.data);
        this.messageHandler(info?.eventName, info?.data);
      } catch (e) {
        console.error('[WS]收到消息，但解析失败:', resp.data);
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
      this.emitEvent('disconnect', this.isError ? 'error' : '');   // 断线事件
      console.log('[WS]连接中断!');
      message.info('[WS]连接中断!');
    };

    this.socket.onerror = () => {
      this.connState = 0;
      this.isError = true;
      this.emitEvent('error'); // 断线事件

      console.error('[WS]连接失败，等待5秒后重新连接...');
      message.error(`[WS]连接失败，等待5秒后重新连接...(${DEFAULT_RETRY_TIMES - this.errorRetryTimes + 1}/${DEFAULT_RETRY_TIMES})`);

      if (this.errorRetryTimes > 0) {
        this.retryWorker = setTimeout(() => {
          this.emitEvent('connecting');
          this.connect(wssUrl, noop, true);
        }, 5000);
        this.errorRetryTimes--;
      } else if (this.socket) {
        this.socket.close();
      }
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
    if (this.retryWorker) clearTimeout(this.retryWorker);
    if (this.socket) {
      this.socket.close();
    }
  }

  subscribe(key, handler) {
    if (!key) throw new Error('key must be a string');
    if (!handler || !isFunction(handler)) throw new Error('handler must be a function');
    this.unsubscribe(key);   // 先移除之前的监听器
    this.eventListener.push({ key, handler });
  }

  unsubscribe(key) {
    if (!key) throw new Error('key must be a string');
    this.eventListener = this.eventListener.filter((item) => item.key !== key);
  }
}

window.GCManageClient = new GCManagerClient();
