import React, { useMemo, useState } from 'react';
import {
  Button, Form, Input, Radio, DatePicker, Space, Layout, message, Select
} from 'antd';
import {
  DeleteOutlined, PlayCircleOutlined, PlusOutlined, MinusOutlined, LockOutlined, UnlockOutlined
} from '@ant-design/icons';
import { useSelector } from 'react-redux';
import PermOptionsList from '@/constants/perm.json';

function SystemAccountPage() {
  const isWSConnected = useSelector((state) => state.system?.systemInfo?.isConnected);

  const [accountName, setAccountName] = useState('');
  const [accountId, setAccountId] = useState('');
  const [accountAction, setAccountAction] = useState('create');
  const [permId, setPermId] = useState('');
  const [permContent, setPermContent] = useState('*');
  const [permAction, setPermAction] = useState('add');
  const [banId, setBanId] = useState('');
  const [banAction, setBanAction] = useState('ban');
  const [banTime, setBanTime] = useState(null);
  const [banReason, setBanReason] = useState('');

  const accountCmdCalc = useMemo(() => {
    if (!accountName) return '';
    return `/account ${accountAction} ${accountName}${accountId ? ` ${accountId}` : ''}`;
  }, [accountId, accountName, accountAction]);

  const permCmdCalc = useMemo(() => {
    if (!permId || !permContent) return '';
    return `/permission ${permAction} @${permId}${permContent ? ` ${permContent}` : ''}`;
  }, [permId, permContent]);

  const banCmdCalc = useMemo(() => {
    if (!banId) return '';
    if (banAction === 'unban') {
      return `/unban @${banId}`;
    }
    return `/ban @${banId} ${banTime ? ` ${Math.floor((+banTime) / 1000)}` : ''}${banReason ? ` ${banReason}` : ''}`;
  }, [banId, banAction, banTime, banReason]);

  const onChange = (value) => {
    setBanTime(value);
  };

  // 发送指令
  const sendCommand = (cmd) => () => {
    if (!window.GCManageClient.isConnected()) {
      message.error('服务器未连接，无法发送');
      return;
    }
    if (!cmd) {
      message.error('无效指令，无法发送');
      return;
    }
    window.GCManageClient.sendCMD(cmd);
  };

  return <Layout.Content className="common-page-layout give-all-page">
    <div className="main-layout">
      <div className="title-bar">用户</div>
      <div className="form-container">
        <Form layout="inline" size="large">
          <Form.Item label="用户名">
            <Input value={accountName} onChange={(e) => setAccountName(e.target.value)} />
          </Form.Item>
          <Form.Item label="指定UID">
            <Input value={accountId} onChange={(e) => setAccountId(e.target.value.replace(/\D/g, ''))} />
          </Form.Item>
          <Form.Item>
            <Radio.Group value={accountAction} onChange={(e) => setAccountAction(e.target.value)}>
              <Radio.Button value="create"><PlusOutlined /> 添加</Radio.Button>
              <Radio.Button value="delete"><DeleteOutlined /> 删除</Radio.Button>
            </Radio.Group>
          </Form.Item>
          <Form.Item label="代码预览">
            <Space>
              <Input readOnly value={accountCmdCalc} style={{ width: 320 }} placeholder="请输入UID" />
              <Button disabled={!isWSConnected || !accountCmdCalc} type="primary" onClick={sendCommand(accountCmdCalc)}><PlayCircleOutlined /> 执行代码</Button>
            </Space>
          </Form.Item>
        </Form>
      </div>
      <div className="title-bar">权限</div>
      <div className="form-container">
        <Form layout="inline" size="large">
          <Form.Item label="目标UID">
            <Input value={permId} onChange={(e) => setPermId(e.target.value.replace(/\D/g, ''))} />
          </Form.Item>
          <Form.Item label="权限">
            <Select
              style={{ width: 320 }}
              options={PermOptionsList}
              value={permContent}
              onSelect={(val) => setPermContent(val)}
            />
          </Form.Item>
          <Form.Item>
            <Radio.Group value={permAction} onChange={(e) => setPermAction(e.target.value)}>
              <Radio.Button value="add"><PlusOutlined /> 添加</Radio.Button>
              <Radio.Button value="remove"><MinusOutlined /> 移除</Radio.Button>
            </Radio.Group>
          </Form.Item>
          <Form.Item label="代码预览">
            <Space>
              <Input readOnly value={permCmdCalc} style={{ width: 320 }} placeholder="请输入UID" />
              <Button disabled={!isWSConnected || !permCmdCalc} type="primary" onClick={sendCommand(permCmdCalc)}><PlayCircleOutlined /> 执行代码</Button>
            </Space>
          </Form.Item>
        </Form>
      </div>
      <div className="title-bar">封禁</div>
      <div className="form-container">
        <Form layout="inline" size="large">
          <Form.Item label="目标UID">
            <Input value={banId} onChange={(e) => setBanId(e.target.value.replace(/\D/g, ''))} />
          </Form.Item>
          <Form.Item label="封禁截止到">
            <DatePicker value={banTime} showTime onChange={onChange} />
          </Form.Item>
          <Form.Item label="封禁理由">
            <Input value={banReason} onChange={(e) => setBanReason(e.target.value)} />
          </Form.Item>
          <Form.Item>
            <Radio.Group value={banAction} onChange={(e) => setBanAction(e.target.value)}>
              <Radio.Button value="ban"><LockOutlined /> 封禁</Radio.Button>
              <Radio.Button value="unban"><UnlockOutlined /> 解封</Radio.Button>
            </Radio.Group>
          </Form.Item>
          <Form.Item label="代码预览">
            <Space>
              <Input readOnly value={banCmdCalc} style={{ width: 320 }} placeholder="请输入UID" />
              <Button disabled={!isWSConnected || !banCmdCalc} type="primary" onClick={sendCommand(banCmdCalc)}><PlayCircleOutlined /> 执行代码</Button>
            </Space>
          </Form.Item>
        </Form>
      </div>
    </div>
  </Layout.Content>;
}

export default SystemAccountPage;
