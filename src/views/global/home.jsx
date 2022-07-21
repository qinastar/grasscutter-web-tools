import React, { useState } from 'react';
import P from 'prop-types';
import {
  Typography, Input, Button, Checkbox, Space, message
} from 'antd';

export function HomePage({ isConnected, startConnect }) {
  const gcSetting = useState((state) => state?.global?.grasscutterConnection);
  const [wssUrl, setWssUrl] = useState(gcSetting?.wssUrl ?? '');
  const [autoConn, setAutoConn] = useState(gcSetting?.autoConn ?? false);

  const confirmConnect = () => {
    if (!wssUrl) {
      message.error('请输入WSS地址');
      return;
    }
    startConnect(wssUrl, autoConn);
  };

  return isConnected ? <div>已连接</div> : <div>
    <Typography.Title level={4}>连接控制台</Typography.Title>
    <Typography.Paragraph>
      <Input placeholder="wss://" value={wssUrl} onChange={(e) => { setWssUrl(e.target.value); }} />
    </Typography.Paragraph>
    <Typography.Paragraph>
      <Space>
        <Button type="primary" onClick={confirmConnect}>连接</Button>
        <Checkbox
          checked={autoConn}
          onChange={(e) => { setAutoConn(e.target.checked); }}
        >
          自动连接
        </Checkbox>
      </Space>
    </Typography.Paragraph>
  </div>;
}

HomePage.propTypes = {
  isConnected: P.bool.isRequired,
  startConnect: P.func.isRequired,
};
