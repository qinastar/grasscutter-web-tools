import React, { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Button, Col, Form, Input, InputNumber, Layout, message, Radio, Row, Select, Switch
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { GiveAllFavListReducer } from '@/store/profiles';
import AnimalList from '@/constants/animal.json';
import MonsterList from '@/constants/monster.json';
import NPCList from '@/constants/npc.json';

const ListMap = {
  animal: AnimalList,
  monster: MonsterList,
  npc: NPCList,
};

function SpawnPage() {
  const dispatch = useDispatch();
  const isWSConnected = useSelector((state) => state.system?.systemInfo?.isConnected);

  const [listType, setListType] = useState('monster');
  const [itemCode, setItemCode] = useState(null);
  const [itemName, setItemName] = useState(null);
  const [itemCount, setItemCount] = useState(1);
  const [itemLevel, setItemLevel] = useState(1);
  const [forUserId, setForUserId] = useState('');

  const calculatedCommand = useMemo(() => {
    if (!itemCode) return '';
    return `/spawn${forUserId ? ` @${forUserId}` : ''} ${itemCode} ${itemCount} lv${itemLevel}`;
  }, [
    forUserId,
    itemCode,
    itemCount,
    itemLevel
  ]);

  const handleAddFav = () => {
    if (!itemCode) {
      message.warn('请选择物品');
      return;
    }
    dispatch(GiveAllFavListReducer.actions.addLocal({
      type: listType,
      code: itemCode,
      name: itemName,
      count: itemCount,
      level: itemLevel,
      forUser: forUserId,
      command: calculatedCommand,
    }));
    message.success('添加成功');
  };

  const ListOptions = useMemo(() => {
    setItemCode(null);
    setItemName(null);
    return ListMap[listType];
  }, [listType]);

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
      <div className="title-bar">召唤参数</div>
      <div className="goods-forms customized-scroll">
        <Form size="large">
          <Form.Item label="类型">
            <Radio.Group value={listType} onChange={(e) => setListType(e.target.value)}>
              <Radio value="monster">讨伐对象</Radio>
              <Radio value="animal">生物志</Radio>
              <Radio value="npc">NPC</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item label="内容">
            <Select
              options={ListOptions}
              showSearch
              placeholder="请选择想要召唤的项目，支持搜索"
              optionFilterProp="label"
              filterOption={
                (input, option) => option.label.toLowerCase().includes(input.toLowerCase())
              }
              value={itemCode}
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
            onChange={(val) => setItemLevel(val)}
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
      {/*<GiveAllFavList />*/}
    </div>
  </Layout.Content>;
}

export default SpawnPage;
