import React, { useEffect, useMemo, useState } from 'react';
import {
  Form, Layout, Select, Row, Col, InputNumber, Avatar, Rate, Typography, Input, Divider, Menu
} from 'antd';
import { QuestionOutlined } from '@ant-design/icons';
import {
  flatten, get, isArray, isEmpty 
} from 'lodash';
import ArtifactGroupsRawData from '@/constants/artifact_groups_map.json';
import ArtifactMainAttrs from '@/constants/artifact_main_attrs.json';
import MonaArtifactMeta from '@/constants/mona/_gen_artifact';
import {
  ArtifactStarLimitation,
  ArtifactMainAttrsLimitation, ArtifactLevelLimitation
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

  const artifactTypeSplited = useMemo(() => {
    return (artifactType || '_').split('_');
  }, [artifactType]);

  // 圣遗物组
  const ArtifactGroupsOptions = useMemo(() => {
    return ArtifactGroupsRawData.map((group, index) => {
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

    const artStarGroupFiltered = (generatorMode === 'strict')
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
    if (generatorMode === 'strict')  {
      if (!artifactType) return [];
      const validValues = ArtifactMainAttrsLimitation[artifactTypeSplited[1]] || [];
      ret = ArtifactMainAttrs.filter((item) => validValues.indexOf(item.value) > -1);
      setArtifactMainAttr(!isEmpty(ret) ? ret[0].value : '');
    }
    return ret.map((item) => ({
      value: item.value,
      label: `${item.label} (${item.value})`,
    }));
  }, [generatorMode, artifactType, artifactTypeSplited]);

  // 当前星级
  const currentStar = useMemo(() => {
    return ArtifactStarOptions[artifactStarIndex]?.group?.star;
  }, [artifactStarIndex, ArtifactStarOptions]);
  // 星级变更
  useEffect(() => {
    if (!generatorMode === 'strict') return;
    if (artifactLevel > ArtifactLevelLimitation[currentStar]) {
      setArtifactLevel(ArtifactLevelLimitation[currentStar]);
    }
  }, [currentStar]);

  // 命令计算
  const calculatedCommand = useMemo(() => {
    if (
      artifactGroupIndex === null || artifactStarIndex === null
      || artifactType === null || artifactMainAttr === null
    ) return '';
    const artStarGroup = get(ArtifactStarOptions, `${artifactStarIndex}.group`);

    const artifactCodeList = artStarGroup[artifactTypeSplited[1]] || [];

    const subAttrsList = [];   // TODO 副词条

    return `/give${forUserId ? ` @${forUserId}` : ''} ${get(artifactCodeList, '0.id')} ${artifactMainAttr} ${subAttrsList.join(' ')} lv${artifactLevel + 1}`;
  }, [
    forUserId,
    ArtifactStarOptions,
    artifactGroupIndex,
    artifactLevel,
    artifactMainAttr,
    artifactStarIndex,
    artifactType,
    artifactTypeSplited
  ]);

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
          <Divider />
          <Input value={calculatedCommand} placeholder="请先选择词条" />
        </Form>
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
