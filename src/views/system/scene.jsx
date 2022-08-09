import React, { useMemo, useState } from 'react';
import { unionBy } from 'lodash';
import {
  Form, Layout, Select, Button, Space, Input, Radio, message
} from 'antd';
import {
  CheckOutlined, PlayCircleOutlined, PlusOutlined
} from '@ant-design/icons';
import JobsList from '@/constants/jobs.json';

const JobsListOptions = unionBy(JobsList, 'value');

function SystemScenePage() {
  const [jobCode, setJobCode] = useState(null);
  const [jobAction, setJobAction] = useState('add');
  const jobCalcCmd = useMemo(() => {
    if (!jobCode) return '';
    return `/quest ${jobAction} ${jobCode}`;
  }, [jobCode, jobAction]);

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
      <div className="title-bar">任务切换</div>
      <div className="form-container">
        <Form layout="inline" size="large">
          <Form.Item label="任务">
            <Select
              value={jobCode}
              onChange={(val) => setJobCode(val)}
              options={JobsListOptions}
              style={{ width: 320 }}
            />
          </Form.Item>
          <Form.Item>
            <Radio.Group value={jobAction} onChange={(e) => setJobAction(e.target.value)}>
              <Radio.Button value="add"><PlusOutlined /> 添加任务</Radio.Button>
              <Radio.Button value="finish"><CheckOutlined /> 完成任务</Radio.Button>
            </Radio.Group>
          </Form.Item>
          <Form.Item>
            <Space>
              <Input value={jobCalcCmd} style={{ width: 320 }} />
              <Button disabled={!jobCalcCmd} type="primary" onClick={sendCommand(jobCalcCmd)}><PlayCircleOutlined /> 执行代码</Button>
            </Space>
          </Form.Item>
        </Form>
      </div>
    </div>
  </Layout.Content>;
}

export default SystemScenePage;
