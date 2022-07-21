import socketio from 'socket.io-client';
import { message } from 'antd';

window.GCServerConnState = 0;  // 0 - closed; 1 - connecting; 2 - connected

export class GCManagerClient {
  constructor() {
    this.socket = null;
    this.connState = 0;  // 0 - closed; 1 - connecting; 2 - connected
    this.stopConn = true;
  }

  conn(wssUrl) {
    if (this.socket) {
      this.socket.close();
    }

    this.socket = socketio(wssUrl, {
      transports: ['websocket'],
    });

    this.socket.stopConn = false;
    this.socket.connect();

    this.socket.on('message', (data) => {
      console.log('[WS]收到消息:', data);
    });

    this.socket.on('connect', () => {
      this.connState = 1;
      console.log('[WS]连接成功!');
    });

    this.socket.on('connect_error', () => {
      if (!this.stopConn) {
        console.log('[WS]连接失败，等待5秒后重新连接...');
        message.error('[WS]连接失败，等待5秒后重新连接...');
        setTimeout(() => {
          this.socket.connect();
        }, 5000);
      } else {
        console.log('[WS]连接失败!');
      }
    });
  }
}

window.GCManageClient = null;
