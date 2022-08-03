import React, {
  useMemo, useState, useCallback, useEffect 
} from 'react';
import {
  Layout, Select, Form, Typography, Rate, Avatar, InputNumber, Row, Col, Input, Button, message
} from 'antd';
import { get } from 'lodash';
import { QuestionOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import WeaponFavList from '@views/give/components/weapon_fav_list';
import WeaponRawList from '@/constants/weapons_map.json';
import MonaWeaponMeta from '@/constants/mona/_gen_weapon';
import { WeaponFavListReducer } from '@/store/profiles';

const StarOptions = [
  { label: '5', value: 5 },
  { label: '4', value: 4 },
  { label: '3', value: 3 },
  { label: '2', value: 2 },
  { label: '1', value: 1 }
];

const TypeOptions = [
  { label: '单手剑', value: 'sword' },
  { label: '双手剑', value: 'claymore' },
  { label: '长柄武器', value: 'polearm' },
  { label: '弓', value: 'bow' },
  { label: '法器', value: 'catalyst' }
];

function GiveWeaponPage() {
  const dispatch = useDispatch();
  const [forUserId, setForUserId] = useState('');
  const [weaponKey, setWeaponKey] = useState('');
  const [weaponName, setWeaponName] = useState('');
  const [weaponType, setWeaponType] = useState(null);
  const [weaponStar, setWeaponStar] = useState(null);
  const [weaponItem, setWeaponItem] = useState(null);
  const [weaponCount, setWeaponCount] = useState(1);
  const [weaponLevel, setWeaponLevel] = useState(90);
  const [weaponRefine, setWeaponRefine] = useState(5);
  const [restoreWeapon, setRestoreWeapon] = useState(null);

  const weaponsListOptions = useMemo(() => {
    if (!weaponType || !weaponStar) return [];
    const listData = get(WeaponRawList, `${weaponType}.${weaponStar}`, []);
    return listData.map((weapon) => {
      const metaInfo = get(MonaWeaponMeta, `${weapon.key}`);
      return {
        key: weapon.key,
        value: weapon.code,
        label: <div className="icon-selector-item">
          <Avatar src={metaInfo?.url} icon={<QuestionOutlined />} />
          <div className="icon-selector-item-meta">
            <div className="icon-selector-item-title">
              {weapon.name} ({weapon.code})
            </div>
            <div className="icon-selector-item-desc">
              {metaInfo?.effect}
            </div>
          </div>
        </div>,
        name: weapon.name,
        searchText: `${weapon.name} ${weapon.code}`,
      };
    });
  }, [weaponType, weaponStar]);

  useEffect(() => {
    if (restoreWeapon) return;
    setWeaponItem(null);
  }, [weaponType, weaponStar]);

  const calculatedCommand = useMemo(() => {
    if (!weaponType || !weaponStar || !weaponItem) return '';
    return `/give${forUserId ? ` @${forUserId}` : ''} ${weaponItem} ${weaponCount} lv${weaponLevel} r${weaponRefine}`;
  }, [
    forUserId,
    weaponType,
    weaponStar,
    weaponItem,
    weaponCount,
    weaponLevel,
    weaponRefine
  ]);

  const handleSaveWeapon = useCallback(() => {
    if (!weaponType || !weaponStar || !weaponItem) {
      message.error('请先选择武器');
      return;
    }
    dispatch(WeaponFavListReducer.actions.addLocal({
      weaponKey,
      weaponName,
      weaponType,
      weaponStar,
      weaponItem,
      weaponCount,
      weaponLevel,
      weaponRefine,
    }));
    message.success('保存成功');
  }, [
    weaponKey,
    weaponName,
    weaponType,
    weaponStar,
    weaponItem,
    weaponCount,
    weaponLevel,
    weaponRefine
  ]);

  // 发送give指令
  const sendWeaponCommand = useCallback(() => {
    if (!window.GCManageClient.isConnected()) {
      message.error('服务器未连接，无法发送');
      return;
    }
    if (!calculatedCommand) {
      message.error('无效指令，无法发送');
      return;
    }
    window.GCManageClient.sendCMD(calculatedCommand);
  }, [calculatedCommand]);

  const handleWeaponRestore = (item) => {
    setRestoreWeapon(item);
    setWeaponKey(item.weaponKey);
    setWeaponName(item.weaponName);
    setWeaponType(item.weaponType);
    setWeaponStar(item.weaponStar);
    setWeaponItem(item.weaponItem);
    setWeaponCount(item.weaponCount);
    setWeaponLevel(item.weaponLevel);
    setWeaponRefine(item.weaponRefine);
    setWeaponKey(item.weaponKey);
  };

  return <Layout.Content className="give-items-page give-weapon-page">
    <div className="main-layout">
      <div className="weapon-forms customized-scroll">
        <Form size="large">
          <Form.Item label="类型">
            <Select
              placeholder="请选择"
              options={TypeOptions}
              value={weaponType}
              onSelect={(val) => {
                setRestoreWeapon(null);
                setWeaponType(val);
              }}
            />
          </Form.Item>
          <Form.Item label="星级">
            <Select
              placeholder="请选择"
              value={weaponStar}
              options={StarOptions.map((item) => {
                return {
                  label: <Rate key={item.value} disabled defaultValue={item.value} />,
                  value: item.value,
                };
              })}
              onSelect={(val) => {
                setRestoreWeapon(null);
                setWeaponStar(val);
              }}
            />
          </Form.Item>
          <Form.Item label="武器">
            <Select
              placeholder="请选择"
              showSearch
              filterOption={(input, option) => option.searchText
                .toLowerCase().includes(input.toLowerCase())}
              className="icon-selector"
              dropdownClassName="icon-selector-dropdown"
              options={weaponsListOptions}
              value={weaponItem}
              onSelect={(val, options) => {
                setWeaponItem(val);
                setWeaponKey(options.key);
                setWeaponName(options.name);
              }}
            />
          </Form.Item>
          <Form.Item label="数量">
            <InputNumber
              min={1}
              value={weaponCount}
              onChange={(val) => setWeaponCount(val)}
            />
          </Form.Item>
          <Form.Item label="等级">
            <InputNumber
              min={1}
              max={90}
              value={weaponLevel}
              onChange={(val) => setWeaponLevel(val)}
            />
          </Form.Item>
          <Form.Item label="精炼">
            <InputNumber
              min={1}
              max={5}
              value={weaponRefine}
              onChange={(val) => setWeaponRefine(val)}
            />
          </Form.Item>
          <Form.Item label="用户">
            <Input value={forUserId} onChange={(e) => setForUserId(e.target.value)} placeholder="@UID" />
          </Form.Item>
        </Form>
      </div>
      <div className="command-layout">
        <Row>
          <Col flex="1 1 auto">
            <Input size="large" value={calculatedCommand} readOnly placeholder="请先选择武器" />
          </Col>
          <Col flex="0 0 auto">
            <Button size="large" onClick={handleSaveWeapon}>存为预设</Button>
            <Button size="large" type="primary" onClick={sendWeaponCommand}>执行生成</Button>
          </Col>
        </Row>
      </div>
    </div>
    <div className="right-layout">
      <WeaponFavList onRestore={handleWeaponRestore} />
    </div>
  </Layout.Content>;
}

export default GiveWeaponPage;
