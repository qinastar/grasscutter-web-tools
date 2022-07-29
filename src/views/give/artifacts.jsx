import React, { useEffect, useMemo, useState } from 'react';
import {
  Form, Layout, Select, Row, Col, InputNumber,
  Avatar, Rate, Typography, Input, Divider, Menu, Button, message
} from 'antd';
import { QuestionOutlined } from '@ant-design/icons';
import { get, isEmpty } from 'lodash';
import SubAttrGroup from '@views/give/components/subattr_group';
import ArtifactGroupsRawData from '@/constants/artifact_groups_map.json';
import ArtifactMainAttrs from '@/constants/artifact_main_attrs.json';
import MonaArtifactMeta from '@/constants/mona/_gen_artifact';
import {
  ArtifactStarLimitation, DuplicatedArtifact,
  ArtifactMainAttrsLimitation, ArtifactLevelLimitation, ArtifactSubAttrMaxLimitation
} from '@/constants/artifact_limitation';

const ArtifactMainAttrsMap = {};
ArtifactMainAttrs.forEach((item) => { ArtifactMainAttrsMap[item.value] = item.label; });

const GeneratorModes = [
  { key: 'strict', label: '严格模式' },
  { key: 'free', label: '自由模式' }
];

const ArtifactTypeOptionsPresets = [
  { label: '生之花', value: 'flower' },
  { label: '死之羽', value: 'feather' },
  { label: '时之沙', value: 'sand' },
  { label: '空之杯', value: 'cup' },
  { label: '理之冠', value: 'head' }
];

function GiveArtifactsPage() {
  const [generatorMode, setGeneratorMode] = useState('strict');
  const [forUserId, setForUserId] = useState('');
  const [artifactGroupIndex, setArtifactGroupIndex] = useState(null);
  const [artifactStarIndex, setArtifactStarIndex] = useState(null);
  const [artifactType, setArtifactType] = useState(null);
  const [artifactLevel, setArtifactLevel] = useState(20);
  const [artifactMainAttr, setArtifactMainAttr] = useState(null);
  const [subAttrList, setSubAttrList] = useState([]);
  const strictMode = generatorMode === 'strict';

  const artifactTypeSplit = useMemo(() => {
    return (artifactType || '_').split('_');
  }, [artifactType]);

  // 圣遗物组
  const ArtifactGroupsOptions = useMemo(() => {
    const list = strictMode ? ArtifactGroupsRawData.filter((item) => {
      return DuplicatedArtifact.indexOf(item.id) === -1;
    }) : ArtifactGroupsRawData;
    return list.map((group, index) => {
      const metas = get(MonaArtifactMeta, group.key, {});
      const [ef2, ef4] = [get(metas, 'effect2', ''), get(metas, 'effect4', '')];
      return {
        name: group.name,
        label: <div className="artifact-group-item">
          <Avatar src={get(metas, 'flower.url') || get(metas, 'head.url')} icon={<QuestionOutlined />} />
          <div className="artifact-group-item-meta">
            <div className="artifact-group-item-title">
              {group.name}
            </div>
            <div className="artifact-group-item-desc">
              {ef2 ? `(2)${ef2}` : ''}{ef4 ? ` (4)${ef4}` : ''}
            </div>
          </div>
        </div>,
        value: index,
      };
    });
  }, [ArtifactGroupsRawData]);

  // 品质
  const ArtifactStarOptions = useMemo(() => {
    if (artifactGroupIndex === null) return [];
    const artGroup = ArtifactGroupsRawData[artifactGroupIndex];
    const artStarGroups = artGroup?.children ?? [];
    if (!isEmpty(artStarGroups)) {
      setArtifactStarIndex(0);
    }

    const limitList = get(ArtifactStarLimitation, artGroup.id, []);

    const artStarGroupFiltered = strictMode
      ? artStarGroups.filter((group) => limitList.indexOf(group.star) > -1)
      : artStarGroups;
    return artStarGroupFiltered.map((group, index) => {
      const key = `${artifactGroupIndex}_${group.star}`;
      return {
        value: index,
        label: <Rate key={key} disabled defaultValue={group.star} />,
        group,
      };
    });
  }, [artifactGroupIndex, generatorMode]);

  // 类型
  const ArtifactTypeOptions = useMemo(() => {
    if (artifactGroupIndex === null) return [];
    const artGroup = ArtifactGroupsRawData[artifactGroupIndex];
    const artStarGroup = ArtifactStarOptions[artifactStarIndex];
    let firstCode = '';
    const ret = ArtifactTypeOptionsPresets.map((info) => {
      const artifactCodeList = get(artStarGroup, `group.${info.value}`) || [];
      if (isEmpty(artifactCodeList)) return null;
      const metas = get(MonaArtifactMeta, artGroup.key, {});
      const aName = get(metas, `${info.value}.chs`);
      const aAvatar = get(metas, `${info.value}.url`);
      return <Select.OptGroup key={info.value} label={`${aName} - ${info.label}`}>
        {artifactCodeList.map((item) => {
          const code = `${item.id}_${info.value}`;
          if (!firstCode) firstCode = code;
          return <Select.Option key={code} value={code}>
            <div className="artifact-group-item">
              <Avatar src={aAvatar} icon={<QuestionOutlined />} />
              <div className="artifact-group-item-meta">
                <div className="artifact-group-item-title">
                  {aName} ({item.id})
                </div>
                <div className="artifact-group-item-desc">
                  {info.label}
                </div>
              </div>
            </div>
          </Select.Option>;
        })}
      </Select.OptGroup>;
    }).filter((item) => !!item);
    if (firstCode) {
      setArtifactType(firstCode);
    }
    return ret;
  }, [artifactGroupIndex, ArtifactStarOptions, artifactStarIndex]);

  // 主词条计算
  const ArtifactMainAttrsFiltered = useMemo(() => {
    let ret = ArtifactMainAttrs;
    if (strictMode)  {
      if (!artifactType) return [];
      const validValues = ArtifactMainAttrsLimitation[artifactTypeSplit[1]] || [];
      ret = ArtifactMainAttrs.filter((item) => validValues.indexOf(item.value) > -1);
      setArtifactMainAttr(!isEmpty(ret) ? ret[0].value : '');
    }
    return ret.map((item) => ({
      value: item.value,
      label: `${item.label} (${item.value})`,
      name: item.label,
    }));
  }, [generatorMode, artifactType, artifactTypeSplit, artifactMainAttr]);

  // 获取主词条名称
  const artifactMainAttrName = useMemo(() => {
    return get(ArtifactMainAttrsFiltered.find((item) => item.value === artifactMainAttr), 'name');
  }, [ArtifactMainAttrsFiltered, artifactMainAttr]);

  // 当前星级
  const currentStar = useMemo(() => {
    return ArtifactStarOptions[artifactStarIndex]?.group?.star;
  }, [artifactStarIndex, ArtifactStarOptions]);
  // 星级变更
  useEffect(() => {
    if (generatorMode !== 'strict') return;
    setArtifactLevel(ArtifactLevelLimitation[currentStar]);
  }, [currentStar]);

  // 计算词条总和
  const sharedWordsCount = useMemo(() => {
    return [0, ...subAttrList].reduce((ans, item) => {
      return ans + [0, ...Object.keys(item.codes)].reduce((ans2, key) => {
        return ans2 + item.codes[key];
      });
    });
  }, [subAttrList]);

  const subAttrCodeList = useMemo(() => {
    const ret = [];
    subAttrList.forEach((item) => {
      Object.keys(item.codes).forEach((code) => {
        if (item.codes[code] > 0) {
          ret.push({ code, count: item.codes[code] });
        }
      });
    });
    return ret;
  }, [subAttrList]);

  // 命令计算
  const calculatedCommand = useMemo(() => {
    if (
      artifactGroupIndex === null || artifactStarIndex === null
      || artifactType === null || artifactMainAttr === null
    ) return '';
    const artStarGroup = get(ArtifactStarOptions, `${artifactStarIndex}.group`);
    const artifactCodeList = get(artStarGroup, artifactTypeSplit[1], []) || [];

    if (strictMode && sharedWordsCount >= ArtifactSubAttrMaxLimitation[currentStar]) {
      return `[error]词条错误，请不要超过${ArtifactSubAttrMaxLimitation[currentStar]}个词条`;
    }

    const subAttrCodeListText = subAttrCodeList.map((item) => `${item.code},${item.count}`);

    return `/give${forUserId ? ` @${forUserId}` : ''} ${get(artifactCodeList, '0.id')} ${artifactMainAttr} ${subAttrCodeListText.join(' ')} lv${artifactLevel + 1}`;
  }, [
    forUserId,
    currentStar,
    sharedWordsCount,
    ArtifactStarOptions,
    artifactGroupIndex,
    artifactLevel,
    artifactMainAttr,
    artifactStarIndex,
    artifactType,
    artifactTypeSplit,
    subAttrCodeList
  ]);

  // 发送give指令
  const sendArtCommand = () => {
    if (!window.GCManageClient.isConnected()) {
      message.error('服务器未连接，无法发送');
      return;
    }
    if (!calculatedCommand || calculatedCommand.indexOf('[error]') > -1) {
      message.error('无效指令，无法发送');
      return;
    }
    window.GCManageClient.sendCMD(calculatedCommand);
  };

  return <Layout.Content className="give-artifact-page">
    <div className="main-layout">
      <Menu
        mode="horizontal"
        items={GeneratorModes}
        selectedKeys={[generatorMode]}
        onSelect={({ key }) => setGeneratorMode(key)}
      />
      <div className="artifact-forms">
        <Form size="large">
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="套装">
                <Select
                  placeholder="请选择"
                  showSearch
                  filterOption={(input, option) => option.name
                    .toLowerCase().includes(input.toLowerCase())}
                  className="artifact-group-selector"
                  dropdownClassName="artifact-group-selector-dropdown"
                  options={ArtifactGroupsOptions}
                  value={artifactGroupIndex}
                  onSelect={(val) => {
                    setArtifactGroupIndex(val);
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="品质">
                <Select
                  placeholder="请选择"
                  options={ArtifactStarOptions}
                  value={artifactStarIndex}
                  onSelect={(val) => {
                    setArtifactStarIndex(val);
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="部位">
                <Select
                  placeholder="请选择"
                  className="artifact-group-selector"
                  dropdownClassName="artifact-group-selector-dropdown"
                  value={artifactType}
                  onSelect={(val) => {
                    setArtifactType(val);
                  }}
                >
                  {ArtifactTypeOptions}
                </Select>

              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="等级">
                <InputNumber size="large" min={1} max={ArtifactLevelLimitation[currentStar] || 20} value={artifactLevel} onChange={(val) => setArtifactLevel(val)} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="主词条">
                <Select
                  placeholder="请选择"
                  options={ArtifactMainAttrsFiltered}
                  value={artifactMainAttr}
                  onSelect={(val) => {
                    setArtifactMainAttr(val);
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="用户">
                <Input value={forUserId} onChange={(e) => setForUserId(e.target.value)} placeholder="@UID" />
              </Form.Item>
            </Col>
          </Row>
          <Divider />
          {(artifactGroupIndex !== null && artifactStarIndex !== null) ? <>
            <Typography.Title level={4}>副词条设定</Typography.Title>
            <SubAttrGroup
              starLevel={currentStar}
              artLevel={artifactLevel}
              strictMode={strictMode}
              onChange={(s) => setSubAttrList(s)}
              artifactMainAttrName={artifactMainAttrName}
            />
            <Divider />
          </> : null}
        </Form>
      </div>
      <div className="command-layout">
        <Row flex>
          <Col flex="1 1 auto">
            <Input size="large" value={calculatedCommand} placeholder="请先选择词条" />
          </Col>
          <Col flex="0 0 auto">
            <Button size="large" onClick={sendArtCommand}>生成</Button>
          </Col>
        </Row>
      </div>
    </div>
    <div className="right-layout">
      <div className="preview-layout">
        <Typography.Title level={4}>主词条：{get(ArtifactMainAttrsMap, artifactMainAttr, '未知')}</Typography.Title>
        <Divider />
        <Typography.Paragraph>
          <Typography.Text strong>暴击率：</Typography.Text>
          <Typography.Text>3.9%</Typography.Text>
        </Typography.Paragraph>
        <Typography.Paragraph>
          <Typography.Text strong>暴击伤害：</Typography.Text>
          <Typography.Text>7.8%</Typography.Text>
        </Typography.Paragraph>
        <Typography.Paragraph>
          <Typography.Text strong>攻击力百分比：</Typography.Text>
          <Typography.Text>5.1%</Typography.Text>
        </Typography.Paragraph>
        <Typography.Paragraph>
          <Typography.Text strong>攻击力：</Typography.Text>
          <Typography.Text>19</Typography.Text>
        </Typography.Paragraph>
      </div>
      <div className="fav-layout">
        <Typography.Title level={4}>预设圣遗物</Typography.Title>
      </div>
    </div>
  </Layout.Content>;
}

export default GiveArtifactsPage;
