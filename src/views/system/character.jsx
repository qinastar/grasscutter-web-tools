import React, { useCallback, useMemo, useState } from 'react';
import {
  Button,
  Form,
  Input,
  Radio,
  Space,
  Layout,
  message,
  Select,
  InputNumber,
  Avatar,
  Switch,
  Modal, Typography
} from 'antd';
import {
  PlayCircleOutlined,
  QuestionOutlined,
  UserOutlined,
  StarOutlined,
  RocketOutlined
} from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { get } from 'lodash';
import CharacterList from '@/constants/character.json';
import MonaCharacterMeta from '@/constants/mona/_gen_character';
import WhosyourdaddyList from '@/constants/whosyourdaddy.json';

const ElementMap = {
  anemo: '风',
  geo: '岩',
  cryo: '冰',
  pyro: '火',
  hydro: '水',
  electro: '雷',
  dendro: '草',
};

const WeaponTypeMap = {
  sword: '单手剑',
  claymore: '双手剑',
  polearm: '长枪',
  bow: '弓',
  catalyst: '法器',
};

const characterMetaMapByChsName = {};
Object.keys(MonaCharacterMeta).forEach((key) => {
  const char = MonaCharacterMeta[key];
  characterMetaMapByChsName[char.chs] = char;
  if (char.chs === '空-风') {
    characterMetaMapByChsName['男主'] = char;
  }
});

function SystemCharacterPage() {
  const isWSConnected = useSelector((state) => state.system?.systemInfo?.isConnected);
  
  const [character, setCharacter] = useState(null);
  const [characterName, setCharacterName] = useState('');
  const [characterLevel, setCharacterLevel] = useState('90');
  const [characterStar, setCharacterStar] = useState('6');
  const [characterTo, setCharacterTo] = useState('');
  const [characterType, setCharacterType] = useState('self');
  const [characterWSDItem, setCharacterWSDItem] = useState(null);
  const [characterWSDAll, setCharacterWSDAll] = useState(false);

  const [talentTo, setTalentTo] = useState('');
  const [talentN, setTalentN] = useState(10);
  const [talentE, setTalentE] = useState(10);
  const [talentQ, setTalentQ] = useState(10);

  const WSDList = useMemo(() => {
    let ret = WhosyourdaddyList;
    if (!characterWSDAll) {
      ret = WhosyourdaddyList.filter((item) => item.character === characterName);
    }
    return ret.map((item) => ({
      label: item.title,
      value: item.id,
      raw: item,
    }));
  }, [characterWSDAll, characterName]);

  const characterListOptions = useMemo(() => {
    return [
      {
        value: 'avatars',
        name: '一键获得所有角色',
        label: <div className="icon-selector-item">
          <Avatar icon={<RocketOutlined />} />
          <div className="icon-selector-item-meta">
            <div className="icon-selector-item-title">
              一键获得所有角色
            </div>
            <div className="icon-selector-item-desc" />
          </div>
        </div>,
        searchText: '一键获得所有角色',
      },
      ...CharacterList.map((charItem) => {
        const metaInfo = get(characterMetaMapByChsName, charItem.label);
        return {
          value: charItem.value,
          name: charItem.label,
          label: <div className="icon-selector-item">
            <Avatar src={metaInfo?.avatar} icon={<QuestionOutlined />} />
            <div className="icon-selector-item-meta">
              <div className="icon-selector-item-title">
                {charItem.label} ({charItem.value})
              </div>
              <div className="icon-selector-item-desc">
                {metaInfo ? <span>
                  {ElementMap[metaInfo?.element?.toLowerCase()]}系
                  {WeaponTypeMap[metaInfo?.weapon?.toLowerCase()]}
                </span> : null}
              </div>
            </div>
          </div>,
          searchText: `${charItem.label} ${charItem.value}`,
        };
      })
    ];
  }, []);

  const characterCmdCalc = useMemo(() => {
    if (!character) return '';
    let characterCode = character;
    let extraText = '';
    if (character !== 'avatars' && characterType === 'star') {
      characterCode = characterCode.replace(/(\d)\d(\d{2})/, '$11$2');
    } else {
      extraText = ` lv${characterLevel} c${characterStar}`;
    }
    return `/give${characterTo ? ` @${characterTo}` : ''} ${characterCode}${extraText}`;
  }, [character, characterLevel, characterStar, characterTo, characterType]);

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

  const handleWSDCommandExecute = useCallback(() => {
    const cmdItem = WhosyourdaddyList.find((item) => item.id === characterWSDItem);
    Modal.confirm({
      title: '操作确认',
      width: 520,
      content: <>
        <Typography.Paragraph>
          <Typography.Text strong>即将执行以下指令，请确认 (另外请设置好目标用户的UID)：</Typography.Text>
        </Typography.Paragraph>
        {cmdItem?.goods?.map((g) => <Typography.Paragraph>{g}</Typography.Paragraph>)}
      </>,
      onOk: () => {
        cmdItem?.goods?.forEach((g) => sendCommand(g)());
      },
    });
  }, [characterWSDItem]);

  return <Layout.Content className="common-page-layout give-all-page">
    <div className="main-layout">
      <div className="title-bar">角色</div>
      <div className="form-container">
        <Form layout="inline" size="large">
          <Form.Item label="角色">
            <Select
              style={{ width: 320 }}
              placeholder="请选择"
              showSearch
              filterOption={(input, option) => option.searchText
                .toLowerCase().includes(input.toLowerCase())}
              className="icon-selector"
              dropdownClassName="icon-selector-dropdown"
              options={characterListOptions}
              value={character}
              onSelect={(val, options) => {
                setCharacter(val);
                setCharacterName(options.name);
                if (!characterWSDAll) {
                  setCharacterWSDItem(null);
                }
              }}
            />
          </Form.Item>
          <Form.Item label="等级">
            <InputNumber
              min={1}
              max={90}
              disabled={characterType === 'star'}
              value={characterLevel}
              onChange={(v) => setCharacterLevel(v)}
            />
          </Form.Item>
          <Form.Item label="命座">
            <InputNumber
              min={0}
              max={6}
              disabled={characterType === 'star'}
              value={characterStar}
              onChange={(v) => setCharacterStar(v)}
            />
          </Form.Item>
          <Form.Item label="指定UID">
            <Input placeholder="@" value={characterTo} onChange={(e) => setCharacterTo(e.target.value.replace(/\D/g, ''))} />
          </Form.Item>
          <Form.Item>
            <Radio.Group disabled={character === 'all'} value={characterType} onChange={(e) => setCharacterType(e.target.value)}>
              <Radio.Button value="self"><UserOutlined /> 角色</Radio.Button>
              <Radio.Button value="star"><StarOutlined /> 命星</Radio.Button>
            </Radio.Group>
          </Form.Item>
          <Form.Item label="代码预览">
            <Space>
              <Input readOnly value={characterCmdCalc} style={{ width: 320 }} placeholder="请输入选择角色" />
              <Button disabled={!isWSConnected || !characterCmdCalc} type="primary" onClick={sendCommand(characterCmdCalc)}><PlayCircleOutlined /> 执行代码</Button>
            </Space>
          </Form.Item>
          <Form.Item label="一键毕业">
            <Space>
              <Select
                placeholder="请选择配置"
                style={{ width: 250 }}
                options={WSDList}
                value={characterWSDItem}
                onSelect={(val) => setCharacterWSDItem(val)}
              />
              <Switch
                checked={characterWSDAll}
                onChange={(val) => {
                  setCharacterWSDAll(val);
                  setCharacterWSDItem(null);
                }}
              />
              不限角色
              <Button disabled={!isWSConnected || !characterWSDItem} type="primary" onClick={handleWSDCommandExecute}><PlayCircleOutlined /> 执行</Button>
            </Space>
          </Form.Item>
        </Form>
      </div>
      <div className="title-bar">天赋（仅对当前场上角色有效）</div>
      <div className="form-container">
        <Form layout="inline" size="large">
          <Form.Item label="指定UID">
            <Input placeholder="@" value={talentTo} onChange={(e) => setTalentTo(e.target.value.replace(/\D/g, ''))} />
          </Form.Item>
          <Form.Item label="普通攻击(A)">
            <Space>
              <InputNumber min={1} max={15} value={talentN} onChange={(val) => setTalentN(val)} />
              <Button disabled={!isWSConnected} type="primary" onClick={sendCommand(`/talent${talentTo ? ` @${talentTo}` : ''} n ${talentN}`)}>设置</Button>
            </Space>
          </Form.Item>
          <Form.Item label="元素战技(E)">
            <Space>
              <InputNumber min={1} max={15} value={talentE} onChange={(val) => setTalentE(val)} />
              <Button disabled={!isWSConnected} type="primary" onClick={sendCommand(`/talent${talentTo ? ` @${talentTo}` : ''} e ${talentE}`)}>设置</Button>
            </Space>
          </Form.Item>
          <Form.Item label="元素爆发(Q)">
            <Space>
              <InputNumber min={1} max={15} value={talentQ} onChange={(val) => setTalentQ(val)} />
              <Button disabled={!isWSConnected} type="primary" onClick={sendCommand(`/talent${talentTo ? ` @${talentTo}` : ''} q ${talentQ}`)}>设置</Button>
            </Space>
          </Form.Item>
        </Form>
      </div>
    </div>
  </Layout.Content>;
}

export default SystemCharacterPage;
