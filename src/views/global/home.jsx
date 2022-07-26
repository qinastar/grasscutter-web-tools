import React, { useEffect, useState } from 'react';
import P from 'prop-types';
import {
  Typography, Input, Button, Checkbox, Space, message, Divider, Row, Col, Progress
} from 'antd';
import { useSelector } from 'react-redux';
import { isEmpty } from 'lodash';
import dayjs from 'dayjs';
import { humanbytes } from '@/utils/unit';

export function HomePage({ startConnect, stopConnect }) {
  const gcSetting = useSelector((state) => state?.settings?.grasscutterConnection);
  const [wssUrl, setWssUrl] = useState(gcSetting?.wssUrl ?? '');
  const [autoConn, setAutoConn] = useState(gcSetting?.autoConn ?? false);
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
    setWssUrl(gcSetting?.wssUrl ?? '');
    setAutoConn(gcSetting?.autoConn ?? false);
  }, [gcSetting]);

  useEffect(() => {
    window.GCManageClient.subscribe('page_home', (type, en, data) => {
      if (type === 'tick') {
        setTickInfo(data);
      }
    });
    return () => {
      window.GCManageClient.unsubscribe('page_home');
    };
  }, []);

  const serverUpTime = (isConnected && !isEmpty(tickInfo))
    ? dayjs.duration(tickInfo.serverUptime) : 0;
  const memProgress = (
    (tickInfo.getAllocatedMemory - tickInfo.getFreeMemory) / tickInfo.getAllocatedMemory
  ) * 100;

  const confirmConnect = () => {
    if (!wssUrl) {
      message.error('请输入WSS地址');
      return;
    }
    startConnect(wssUrl, autoConn);
  };

  return <div className="gwt-pages-home">
    <Typography.Title level={4}>连接服务器</Typography.Title>
    <Typography.Paragraph>
      <Input disabled={isConnecting || isConnected} placeholder="wss://" value={wssUrl} onChange={(e) => { setWssUrl(e.target.value); }} />
    </Typography.Paragraph>
    <Typography.Paragraph>
      <Space>
        {isConnected ? <Button type="danger" onClick={stopConnect}>断开连接</Button> : <Button type="primary" onClick={confirmConnect} loading={isConnecting}>{isConnecting ? '连接中...' : '连接'}</Button>}
        {isConnecting && <Button type="danger" onClick={stopConnect}>取消连接</Button>}
        <Checkbox
          checked={autoConn}
          disabled={isConnecting || isConnected}
          onChange={(e) => { setAutoConn(e.target.checked); }}
        >
          自动连接
        </Checkbox>
      </Space>
    </Typography.Paragraph>
    <Divider />
    {isConnected && <Row className="system-info-layout">
      <Col span={12}>
        <Typography.Title level={3}>运行状态</Typography.Title>
        <Typography.Paragraph>
          <Space>
            <Typography.Text>
              系统运行时间：
            </Typography.Text>
            <Typography.Text>
              {Math.floor(tickInfo.serverUptime / 86400000)}天{serverUpTime.format('HH小时mm分ss秒')}
            </Typography.Text>
          </Space>
        </Typography.Paragraph>
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
          <Progress
            strokeColor={{
              '0%': '#108ee9',
              '100%': '#87d068',
            }}
            percent={memProgress}
            showInfo={false}
          />
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
      </Col>
      <Col span={12}>
        <Typography.Title level={3}>系统信息</Typography.Title>
        <Typography.Paragraph>
          <Space>
            <Typography.Text>
              服务器地址：
            </Typography.Text>
            <Typography.Text>
              {systemInfo?.baseData?.IP}
            </Typography.Text>
          </Space>
        </Typography.Paragraph>
        <Typography.Paragraph>
          <Space>
            <Typography.Text>
              操作系统：
            </Typography.Text>
            <Typography.Text>
              {systemInfo?.baseData?.SystemVersion}
            </Typography.Text>
          </Space>
        </Typography.Paragraph>
        <Typography.Paragraph>
          <Space>
            <Typography.Text>
              服务名称：
            </Typography.Text>
            <Typography.Text>
              {systemInfo?.baseData?.ServerName}
            </Typography.Text>
          </Space>
        </Typography.Paragraph>
        <Typography.Paragraph>
          <Space>
            <Typography.Text>
              Java版本：
            </Typography.Text>
            <Typography.Text>
              {systemInfo?.baseData?.JavaVersion}
            </Typography.Text>
          </Space>
        </Typography.Paragraph>
        <Typography.Paragraph>
          <Space>
            <Typography.Text>
              插件版本：
            </Typography.Text>
            <Typography.Text>
              {systemInfo?.baseData?.GrVersion}
            </Typography.Text>
          </Space>
        </Typography.Paragraph>
      </Col>
    </Row>}
  </div>;
}

HomePage.propTypes = {
  startConnect: P.func.isRequired,
  stopConnect: P.func.isRequired,
};
