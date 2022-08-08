import React, { useState, useMemo } from 'react';
import {
  Form, Select, Layout, InputNumber, Switch, Row, Col, Input, Button, message, Typography
} from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { PlusOutlined } from '@ant-design/icons';
import GiveAllFavList from '@views/give/components/give_all_fav_list';
import GoodsList from '@/constants/goods.json';
import { GiveAllFavListReducer } from '@/store/profiles';

function GiveAllPage() {
  const dispatch = useDispatch();
  const isWSConnected = useSelector((state) => state.system?.systemInfo?.isConnected);

  const [itemCode, setItemCode] = useState(null);
  const [itemName, setItemName] = useState(null);
  const [itemCount, setItemCount] = useState(1);
  const [itemLevel, setItemLevel] = useState(1);
  const [isDrop, setIsDrop] = useState(false);
  const [forUserId, setForUserId] = useState('');

  const calculatedCommand = useMemo(() => {
    if (!itemCode) return '';
    return `/${isDrop ? 'drop' : 'give'}${forUserId ? ` @${forUserId}` : ''} ${itemCode} ${isDrop ? '' : 'x'}${itemCount}${isDrop ? '' : ` lv${itemLevel}`}`;
  }, [
    forUserId,
    itemCode,
    itemCount,
    itemLevel,
    isDrop
  ]);

  const handleAddFav = () => {
    if (!itemCode) {
      message.warn('请选择物品');
      return;
    }
    dispatch(GiveAllFavListReducer.actions.addLocal({
      isDrop,
      code: itemCode,
      name: itemName,
      count: itemCount,
      level: itemLevel,
      forUser: forUserId,
      command: calculatedCommand,
    }));
    message.success('添加成功');
  };

  const GoodsListOptions = GoodsList.map((item) => ({ ...item, name: item.label, label: `${item.value}: ${item.label}` }));

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
      <div className="title-bar">物品参数</div>
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
              onChange={(val, option) => {
                setItemCode(val);
                setItemName(option.name);
              }}
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
        <Form.Item label="用户">
          <Input value={forUserId} onChange={(e) => setForUserId(e.target.value)} placeholder="@UID" />
        </Form.Item>
      </div>
      <div className="command-layout">
        <Row>
          <Col flex="1 1 auto">
            <Input size="large" value={calculatedCommand} readOnly placeholder="请先选择物品" />
          </Col>
          <Col flex="0 0 auto">
            <Button size="large" onClick={handleAddFav}>
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
      <GiveAllFavList />
    </div>
  </Layout.Content>;
}

export default GiveAllPage;
