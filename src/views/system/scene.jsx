import React, { useMemo, useState } from 'react';
import { unionBy } from 'lodash';
import {
  Form, Layout, Select, Button, Space, Input, Radio, message, Switch, Alert
} from 'antd';
import {
  CheckOutlined, PlayCircleOutlined, PlusOutlined
} from '@ant-design/icons';
import { useSelector } from 'react-redux';
import JobsList from '@/constants/jobs.json';
import SceneList from '@/constants/scene.json';

const JobsListOptions = unionBy(JobsList, 'value');
const SceneListOptions = unionBy(SceneList, 'value');

const weatherOptions = [
  { value: 'none', label: '无' },
  { value: 'sunny', label: '晴天' },
  { value: 'cloudy', label: '阴天' },
  { value: 'rain', label: '雨天' },
  { value: 'thunderstorm', label: '雷暴' },
  { value: 'snow', label: '雪天' },
  { value: 'mist', label: '雾天' }
];

function SystemScenePage() {
  const isWSConnected = useSelector((state) => state.system?.systemInfo?.isConnected);
  const [jobCode, setJobCode] = useState(null);
  const [jobAction, setJobAction] = useState('add');
  const [weather, setWeather] = useState('none');
  const [sceneCode, setSceneCode] = useState(null);
  const [coordinate, setCoordinate] = useState(false);
  const [coordinateX, setCoordinateX] = useState('200');
  const [coordinateY, setCoordinateY] = useState('100');
  const [coordinateZ, setCoordinateZ] = useState('0');

  const jobCalcCmd = useMemo(() => {
    if (!jobCode) return '';
    return `/quest ${jobAction} ${jobCode}`;
  }, [jobCode, jobAction]);

  const sceneCalcCmd = useMemo(() => {
    return `/tp ${coordinate ? coordinateX : '~'} ${coordinate ? coordinateY : '~'} ${coordinate ? coordinateZ : '~'}${sceneCode ? ` ${sceneCode}` : ''}`;
  }, [coordinate, coordinateX, coordinateY, coordinateZ, sceneCode]);

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
      <div className="title-bar">任务</div>
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
              <Input readOnly value={jobCalcCmd} style={{ width: 320 }} />
              <Button disabled={!isWSConnected || !jobCalcCmd} type="primary" onClick={sendCommand(jobCalcCmd)}><PlayCircleOutlined /> 执行代码</Button>
            </Space>
          </Form.Item>
        </Form>
        <Alert message="提示：目前任务需要服务端脚本控制，所以大多数任务可以接，可以完成，但不一定可以做。" type="warning" />
      </div>
      <div className="title-bar">天气控制</div>
      <div className="form-container">
        <Form layout="inline" size="large">
          <Form.Item label="天气">
            <Select
              value={weather}
              onChange={(val) => setWeather(val)}
              options={weatherOptions}
            />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" onClick={sendCommand(`/weather ${weather}`)} disabled={!isWSConnected}><PlayCircleOutlined /> 执行代码</Button>

            </Space>
          </Form.Item>
        </Form>
      </div>
      <div className="title-bar">场景与传送</div>
      <div className="form-container">
        <Form layout="inline" size="large">
          <Form.Item label="场景">
            <Select
              allowClear
              placeholder="无场景"
              value={sceneCode}
              onChange={(val) => setSceneCode(val)}
              options={SceneListOptions}
              style={{ width: 320 }}
            />
          </Form.Item>
          <Form.Item label="启用坐标">
            <Switch checked={coordinate} onChange={(val) => setCoordinate(val)} />
          </Form.Item>
          <Form.Item label="X">
            <Input value={coordinateX} onChange={(e) => setCoordinateX(e.target.value.replace(/[^\d~]/g, ''))} />
          </Form.Item>
          <Form.Item label="Y">
            <Input value={coordinateY} onChange={(e) => setCoordinateY(e.target.value.replace(/[^\d~]/g, ''))} />
          </Form.Item>
          <Form.Item label="Z">
            <Input value={coordinateZ} onChange={(e) => setCoordinateZ(e.target.value.replace(/[^\d~]/g, ''))} />
          </Form.Item>
        </Form>
        <Input.Group compact style={{ marginBottom: 16 }}>
          <Input size="large" readOnly value={sceneCalcCmd} style={{ width: 'calc(100% - 140px)' }} />
          <Button size="large" disabled={!isWSConnected} type="primary" onClick={sendCommand(sceneCalcCmd)}><PlayCircleOutlined /> 执行代码</Button>
        </Input.Group>
        <Alert message="提示：大部分场景没有效果，无法进入；可以用~表示当前位置，如 ~100 表示相对当前100。" type="warning" />
      </div>
      {/*<Typography.Text></Typography.Text>*/}
    </div>
  </Layout.Content>;
}

export default SystemScenePage;
