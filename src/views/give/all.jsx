import React, { useState, useMemo } from 'react';
import {
  Form, Select, Layout, InputNumber, Switch, Row, Col, Input, Button, message, Typography
} from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { PlusOutlined } from '@ant-design/icons';
import GoodsList from '@/constants/goods.json';

function GiveAllPage() {
  const dispatch = useDispatch();
  const isWSConnected = useSelector((state) => state.system?.systemInfo?.isConnected);

  const [itemCode, setItemCode] = useState(null);
  const [itemCount, setItemCount] = useState(1);
  const [itemLevel, setItemLevel] = useState(1);
  const [isDrop, setIsDrop] = useState(false);

  const calculatedCommand = useMemo(() => {
    if (!itemCode) return '';
    return `/${isDrop ? 'drop' : 'give'} ${itemCode} ${isDrop ? '' : 'x'}${itemCount}${isDrop ? '' : ` lv${itemLevel}`}`;
  }, [
    itemCode,
    itemCount,
    itemLevel,
    isDrop
  ]);

  const GoodsListOptions = GoodsList.map((item) => ({ ...item, label: `${item.value}: ${item.label}` }));

  // 发送give指令
  const sendWeaponCommand = () => {
    if (!window.GCManageClient.isConnected()) {
      message.error('服务器未连接，无法发送');
      return;
    }
    if (!calculatedCommand) {
      message.error('无效指令，无法发送');
      return;
    }
    window.GCManageClient.sendCMD(calculatedCommand);
  };

  return <Layout.Content className="common-page-layout give-all-page">
    <div className="main-layout">
      <div className="goods-forms customized-scroll">
        <Form size="large">
          <Form.Item label="物品">
            <Select
              options={GoodsListOptions}
              showSearch
              placeholder="请选择物品，支持搜索"
              optionFilterProp="label"
              filterOption={
                (input, option) => option.label.toLowerCase().includes(input.toLowerCase())
              }
              onChange={(val) => setItemCode(val)}
            />
          </Form.Item>
        </Form>
        <Form.Item label="数量">
          <InputNumber
            min={1}
            value={itemCount}
            onChange={(val) => setItemCount(val)}
          />
        </Form.Item>
        <Form.Item label="等级">
          <InputNumber
            min={1}
            max={90}
            value={itemLevel}
            disabled={isDrop}
            onChange={(val) => setItemLevel(val)}
          />
        </Form.Item>
        <Form.Item label="掉落">
          <Switch
            checked={isDrop}
            onChange={(val) => setIsDrop(val)}
          />
        </Form.Item>
        <Form.Item />
      </div>
      <div className="command-layout">
        <Row>
          <Col flex="1 1 auto">
            <Input size="large" value={calculatedCommand} readOnly placeholder="请先选择物品" />
          </Col>
          <Col flex="0 0 auto">
            <Button size="large">
              <PlusOutlined /> 添加到预设
            </Button>
            <Button size="large" type="primary" disabled={!isWSConnected} onClick={sendWeaponCommand}>
              执行生成
            </Button>
          </Col>
        </Row>
      </div>
    </div>
    <div className="right-layout">
      <div className="fav-layout">
        <div className="title-bar">
          <div className="left-area">
            <Typography.Title className="title" level={5}>物品预设</Typography.Title>
          </div>
          <div className="right-area">
            <Button type="primary" disabled={!isWSConnected}>
              批量执行
            </Button>
          </div>
        </div>
      </div>
    </div>
  </Layout.Content>;
}

export default GiveAllPage;
