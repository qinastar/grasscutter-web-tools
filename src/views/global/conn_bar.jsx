import React, { useEffect, useState } from 'react';
import dayjs  from 'dayjs';
import {
  Tag, Popover, Typography, Space, Spin
} from 'antd';
import classnames from 'classnames';
import { DisconnectOutlined, LinkOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { isEmpty } from 'lodash';
import { humanbytes } from '@/utils/unit';

function ConnStatusBar() {
  const systemInfo = useSelector((state) => state.system?.systemInfo ?? {});
  const isConnected = systemInfo?.isConnected;
  const isConnecting = systemInfo?.isConnecting;
  const [tickInfo, setTickInfo] = useState({
    getAllocatedMemory: 0,
    getFreeMemory: 0,
    playerCount: 0,
    serverUptime: 0,
    tickTimeElapsed: 0,
  });

  useEffect(() => {
    window.GCManageClient.subscribe('conn_bar', (type, en, data) => {
      if (type === 'tick') {
        setTickInfo(data);
      }
    });
    return () => {
      window.GCManageClient.unsubscribe('conn_bar');
    };
  }, []);

  const serverUpTime = (isConnected && !isEmpty(tickInfo))
    ? dayjs.duration(tickInfo.serverUptime) : 0;

  return !isConnected
    ? <div
        className={classnames('gwt-header-conn-status', { 'is-connected': isConnected, 'is-disconnect': !isConnected, 'is-connecting': isConnecting })}
    >
      {isConnecting ? <><Spin /> 服务器连接中...</> : <><DisconnectOutlined /> 服务端已断开</>}
    </div> : <Popover
      title="运行状态"
      placement="bottomRight"
      content={(isConnected && !isEmpty(tickInfo)) ? <>
        <Typography.Paragraph>
          <Space>
            <Typography.Text>
              JVM内存占用：
            </Typography.Text>
            <Typography.Text>
              {humanbytes(tickInfo.getAllocatedMemory - tickInfo.getFreeMemory)}(已使用) /
              {humanbytes(tickInfo.getAllocatedMemory)}(总数)
            </Typography.Text>
          </Space>
        </Typography.Paragraph>
        <Typography.Paragraph>
          <Space>
            <Typography.Text>
              在线玩家数量：
            </Typography.Text>
            <Typography.Text>
              {tickInfo.playerCount}
            </Typography.Text>
          </Space>
        </Typography.Paragraph>
        <Typography.Paragraph>
          <Space>
            <Typography.Text>
              Tick耗时：
            </Typography.Text>
            <Typography.Text>
              {tickInfo.tickTimeElapsed}ms
            </Typography.Text>
          </Space>
        </Typography.Paragraph>
      </> : null}
    >
      <div
        className={classnames('gwt-header-conn-status', { 'is-connected': isConnected, 'is-disconnect': !isConnected })}
      >
        <Tag color="green">服务已运行{isConnected ? `${Math.floor(tickInfo.serverUptime / 86400000)}天${serverUpTime.format('HH小时mm分ss秒')}` : ''}</Tag>

        <LinkOutlined /> 服务端已连接
      </div>
    </Popover>;
}

export default ConnStatusBar;
