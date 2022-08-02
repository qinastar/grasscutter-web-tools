import React, {
  useCallback, useEffect, useMemo, useRef, useState
} from 'react';
import {
  Form, Layout, Select, Row, Col, InputNumber,
  Avatar, Rate, Typography, Input, Divider, Menu, Button, message, Space
} from 'antd';
import { QuestionOutlined } from '@ant-design/icons';
import { get, isEmpty } from 'lodash';
import SubAttrStrict from '@views/give/components/subattr_strict';
import SubAttrFreeList from '@views/give/components/subattr_free';
import ArtifactFavList from '@views/give/components/fav_list';
import { useDispatch } from 'react-redux';
import ArtifactGroupsRawData from '@/constants/artifact_groups_map.json';
import ArtifactSubAttrsGroupMapping from '@/constants/artifact_sub_attrs_group_map.json';
import ArtifactMainAttrs from '@/constants/artifact_main_attrs.json';
import MonaArtifactMeta from '@/constants/mona/_gen_artifact';
import {
  ArtifactStarLimitation, DuplicatedArtifact,
  ArtifactMainAttrsLimitation, ArtifactLevelLimitation, ArtifactSubAttrMaxLimitation
} from '@/constants/artifact_limitation';
import { ArtifactFavListReducer } from '@/store/profiles';
import PromptConfirm from '@/utils/pconfirm';

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

const ArtifactTypeNameMap = {
  flower: '生之花',
  feather: '死之羽',
  sand: '时之沙',
  cup: '空之杯',
  head: '理之冠',
};

function GiveArtifactsPage() {
  const dispatch = useDispatch();
  const [generatorMode, setGeneratorMode] = useState('strict');
  const [forUserId, setForUserId] = useState('');
  const [artifactGroupId, setArtifactGroupId] = useState(null);
  const [artifactStar, setArtifactStar] = useState(null);
  const [artifactType, setArtifactType] = useState(null);
  const [artifactLevel, setArtifactLevel] = useState(20);
  const [artifactMainAttr, setArtifactMainAttr] = useState(null);
  const [subAttrList, setSubAttrList] = useState([]);
  const [subAttrListFree, setSubAttrListFree] = useState([]);
  const [startupList, setStartupList] = useState([]);
  const confirmRef = useRef();

  const strictMode = useMemo(() => {
    return generatorMode === 'strict';
  }, [generatorMode]);

  const artifactTypeSplit = useMemo(() => {
    return (artifactType || '_').split('_');
  }, [artifactType]);

  const ArtifactGroupsRawDataList = useMemo(() => {
    return strictMode ? ArtifactGroupsRawData.filter((item) => {
      return DuplicatedArtifact.indexOf(item.id) === -1;
    }) : ArtifactGroupsRawData;
  }, [strictMode]);

  // 圣遗物组
  const ArtifactGroupsOptions = useMemo(() => {
    return ArtifactGroupsRawDataList.map((group) => {
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
        value: group.id,
      };
    });
  }, [ArtifactGroupsRawDataList]);

  useEffect(() => {
    setArtifactGroupId(null);
    setArtifactStar(null);
    setArtifactType(null);
    setArtifactMainAttr(null);
    setStartupList([]);
    setSubAttrList([]);
    setSubAttrListFree([]);
  }, [strictMode]);

  const artifactGroup = useMemo(() => {
    if (artifactGroupId === null) return [];
    return ArtifactGroupsRawDataList.find((item) => item.id === artifactGroupId);
  }, [artifactGroupId]);

  // 品质
  const ArtifactStarOptions = useMemo(() => {
    if (!artifactGroup) return [];
    const artStarGroups = artifactGroup?.children ?? [];
    if (isEmpty(artStarGroups)) {
      setArtifactStar(null);
      return [];
    }

    const limitList = get(ArtifactStarLimitation, artifactGroup.id, []);

    const artStarGroupFiltered = strictMode
      ? artStarGroups.filter((group) => limitList.indexOf(group.star) > -1)
      : artStarGroups;
    const ret = artStarGroupFiltered.map((group, index) => {
      const key = `${artifactGroupId}_${group.star}`;
      return {
        value: group.star,
        label: <Rate key={key} disabled defaultValue={group.star} />,
        group,
      };
    });
    if (!isEmpty(ret)) {
      setArtifactStar(get(ret, '0.value', null));
    } else {
      setArtifactStar(null);
    }
    return ret;
  }, [artifactGroup, strictMode]);

  const artifactGroupWithStar = useMemo(() => {
    return ArtifactStarOptions.find((item) => item.value === artifactStar);
  }, [artifactStar, ArtifactStarOptions]);

  // 部位
  const ArtifactTypeOptions = useMemo(() => {
    if (!artifactGroup || !artifactGroupWithStar) return [];
    let firstCode = '';
    const codesList = [];
    const ret = ArtifactTypeOptionsPresets.map((info) => {
      const artifactCodeList = get(artifactGroupWithStar, `group.${info.value}`) || [];
      if (isEmpty(artifactCodeList)) return null;
      const metas = get(MonaArtifactMeta, artifactGroup.key, {});
      const aName = get(metas, `${info.value}.chs`) || get(artifactCodeList, '0.name');
      const aAvatar = get(metas, `${info.value}.url`);
      return <Select.OptGroup key={info.value} label={`${aName} - ${info.label}`}>
        {artifactCodeList.map((item) => {
          const code = `${item.id}_${info.value}`;
          if (!firstCode) firstCode = code;
          codesList.push(code);
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
    const isTypeExist = codesList.includes(artifactType);
    if (!isTypeExist && firstCode) {
      setArtifactType(firstCode);
    }
    return ret;
  }, [artifactGroup, artifactGroupWithStar, artifactType]);

  // 主词条计算
  const ArtifactMainAttrsFiltered = useMemo(() => {
    let ret = ArtifactMainAttrs;
    if (!artifactType) {
      setArtifactMainAttr(null);
      return [];
    }
    if (strictMode)  {
      const validValues = ArtifactMainAttrsLimitation[artifactTypeSplit[1]] || [];
      ret = ArtifactMainAttrs.filter((item) => validValues.indexOf(item.value) > -1);
    }
    const isMasterAttrExist = !!ret.find((item) => item.value === artifactMainAttr);
    setArtifactMainAttr(!isMasterAttrExist ? ret[0].value : artifactMainAttr);

    return ret.map((item) => ({
      value: item.value,
      label: `${item.label} (${item.value})`,
      masterAttrName: item.label,
    }));
  }, [artifactMainAttr, strictMode, artifactType, artifactTypeSplit]);

  // 获取主词条名称
  const artifactMainAttrName = useMemo(() => {
    return get(ArtifactMainAttrsFiltered.find((item) => item.value === artifactMainAttr), 'masterAttrName');
  }, [ArtifactMainAttrsFiltered, artifactMainAttr]);

  // 当前星级
  const currentStar = useMemo(() => {
    return artifactGroupWithStar?.value ?? 0;
  }, [artifactGroupWithStar]);

  // 星级变更
  useEffect(() => {
    if (!strictMode) {
      setArtifactLevel(20);
    } else {
      setArtifactLevel(ArtifactLevelLimitation[currentStar]);
    }
  }, [currentStar, strictMode]);

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

  const subAttrCodeListFree = useMemo(() => {
    const ret = {};
    subAttrListFree.forEach((item) => {
      if (!ret[item.value]) {
        ret[item.value] = 0;
      }
      ret[item.value]++;
    });
    return Object.keys(ret).map((key) => {
      return { code: key, count: ret[key] };
    });
  }, [subAttrListFree]);

  // 命令计算
  const calculatedCommand = useMemo(() => {
    if (
      !artifactGroup || !artifactGroupWithStar
      || artifactType === null || artifactMainAttr === null
    ) return '';
    const artStarGroup = artifactGroupWithStar.group;
    const artifactCodeList = get(artStarGroup, artifactTypeSplit[1], []) || [];
    if (strictMode && sharedWordsCount > ArtifactSubAttrMaxLimitation[currentStar]) {
      return `[error]词条错误，请不要超过${ArtifactSubAttrMaxLimitation[currentStar]}个词条`;
    }

    const subAttrCodeListText = (strictMode ? subAttrCodeList : subAttrCodeListFree).map((item) => `${item.code},${item.count}`);

    return `/give${forUserId ? ` @${forUserId}` : ''} ${get(artifactCodeList, '0.id')} ${artifactMainAttr} ${subAttrCodeListText.join(' ')} lv${artifactLevel + 1}`;
  }, [
    strictMode,
    forUserId,
    currentStar,
    sharedWordsCount,
    artifactGroupWithStar,
    artifactGroup,
    artifactLevel,
    artifactMainAttr,
    artifactType,
    artifactTypeSplit,
    subAttrCodeList,
    subAttrCodeListFree
  ]);

  // 发送give指令
  const sendArtCommand = useCallback(() => {
    if (!window.GCManageClient.isConnected()) {
      message.error('服务器未连接，无法发送');
      return;
    }
    if (!calculatedCommand || calculatedCommand.indexOf('[error]') > -1) {
      message.error('无效指令，无法发送');
      return;
    }
    window.GCManageClient.sendCMD(calculatedCommand);
  }, [calculatedCommand]);

  // 词条预览
  const subAttrPreviewList = useMemo(() => {
    if (isEmpty(subAttrList)) return [];
    return subAttrList.map((item) => {
      const group = ArtifactSubAttrsGroupMapping[item.group] ?? {};
      return {
        name: group?.name,
        value: item.outputValue,
        isPercent: item.isPercent,
      };
    }).filter((item) => !!item.name);
  }, [subAttrList]);

  const handleSaveArtifact = () => {
    if (!calculatedCommand || calculatedCommand.indexOf('[error]') > -1) {
      message.error('无效圣遗物，无法存储');
      return;
    }
    if (confirmRef.current) {
      confirmRef.current.showModal();
    }
  };

  // 保存圣遗物数据
  const saveArtifact = useCallback((remark) => {
    const ret = {
      strictMode,
      artifactGroupId,
      artifactStar,
      artifactType,
      artifactLevel,
      artifactMainAttr,
      meta: {
        name: get(artifactGroup, 'name', 'null'), // 名称
        type: artifactTypeSplit[1],
        typeName: get(ArtifactTypeNameMap, artifactTypeSplit[1], 'null'), // 部位
        key: get(artifactGroup, 'key', 'null'),
        remark, // 备注
      },
    };
    if (strictMode) {
      ret.subAttrList = subAttrList;
    } else {
      ret.subAttrList = subAttrListFree;
    }
    dispatch(ArtifactFavListReducer.actions.addLocal(ret));
    message.success('保存成功');
  }, [
    strictMode,
    artifactGroup,
    ArtifactTypeNameMap,
    artifactGroupId,
    artifactStar,
    artifactType,
    artifactTypeSplit,
    artifactLevel,
    artifactMainAttr,
    subAttrList,
    subAttrListFree,
    calculatedCommand
  ]);

  const handleRestoreArtifact = (item) => {
    setGeneratorMode(item.strictMode ? 'strict' : 'free');
    setArtifactGroupId(item.artifactGroupId);
    setArtifactStar(item.artifactStar);
    setArtifactType(item.artifactType);
    setArtifactLevel(item.artifactLevel);
    setArtifactMainAttr(item.artifactMainAttr);
    setStartupList(item.subAttrList || []);
    if (item.strictMode) {
      setSubAttrList(item.subAttrList || []);
    } else {
      setSubAttrListFree(item.subAttrList || []);
    }
  };

  return <Layout.Content className="give-artifact-page">
    <div className="main-layout">
      <Menu
        mode="horizontal"
        items={GeneratorModes}
        selectedKeys={[generatorMode]}
        onSelect={({ key }) => setGeneratorMode(key)}
      />
      <div className="artifact-forms customized-scroll">
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
                  value={artifactGroupId}
                  onSelect={(val) => {
                    setArtifactGroupId(val);
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="品质">
                <Select
                  placeholder="请选择"
                  options={ArtifactStarOptions}
                  value={artifactStar}
                  onSelect={(val) => {
                    setArtifactStar(val);
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
                <InputNumber size="large" min={1} max={strictMode ? (ArtifactLevelLimitation[currentStar] || 20) : 20} value={artifactLevel} onChange={(val) => setArtifactLevel(val)} style={{ width: '100%' }} />
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
          {(artifactGroup && artifactStar !== null) ? <>
            <Typography.Title level={4}>副词条设定</Typography.Title>
            <Divider className="no-top-margin" />
            {strictMode ? <SubAttrStrict
              starLevel={currentStar}
              artLevel={artifactLevel}
              onChange={(s) => setSubAttrList(s)}
              startupList={startupList}
              artifactMainAttrName={artifactMainAttrName}
            /> : <SubAttrFreeList
              onChange={(s) => setSubAttrListFree(s)}
            />}
          </> : null}
        </Form>
        <PromptConfirm ref={confirmRef} title="保存圣遗物预设" messageText="请设置圣遗物备注，也可以留空" onOk={saveArtifact} />
      </div>
      <div className="command-layout">
        <Row>
          <Col flex="1 1 auto">
            <Input size="large" value={calculatedCommand} placeholder="请先选择词条" />
          </Col>
          <Col flex="0 0 auto">
            <Button size="large" onClick={handleSaveArtifact}>存为预设</Button>
            <Button size="large" type="primary" onClick={sendArtCommand}>执行生成</Button>
          </Col>
        </Row>
      </div>
    </div>
    <div className="right-layout">
      <div className="preview-layout customized-scroll">
        <Typography.Title level={5}>主词条：{get(ArtifactMainAttrsMap, artifactMainAttr, '未知')}</Typography.Title>
        <Divider />
        {strictMode ? (subAttrPreviewList.length
          ? subAttrPreviewList.map((item) => <Typography.Paragraph key={`sub_attr_${item.name}`}>
            <Typography.Text strong>{item.name}：</Typography.Text>
            <Typography.Text>{item.value}{item.isPercent ? '%' : ''}</Typography.Text>
          </Typography.Paragraph>)
          : <Typography.Text>请先选择副词条</Typography.Text>)
          : <Typography.Text>自由模式不支持预览</Typography.Text>}
      </div>
      <ArtifactFavList restoreArtifact={handleRestoreArtifact} />
    </div>
  </Layout.Content>;
}

export default GiveArtifactsPage;
