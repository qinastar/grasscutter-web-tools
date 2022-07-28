import React, { useEffect, useState, useMemo } from 'react';
import P from 'prop-types';
import {
  Col, Form, InputNumber, Row, Select, Space, Switch, Tooltip 
} from 'antd';
import { QuestionCircleFilled } from '@ant-design/icons';
import { ArtifactSubAttrCateMaxLimitation } from '@/constants/artifact_limitation';
import ArtifactSubAttrsMapping from '@/constants/artifact_sub_attrs_map.json';
import ArtifactSubAttrsGroupMapping from '@/constants/artifact_sub_attrs_group_map.json';

function SubAttrInput({
  index,
  defaultOptions,
  strictMode,
  starLevel,
  onChange,
}) {
  const [transfer, setTransfer] = useState(defaultOptions.transfer);
  const [codes, setCodes] = useState(defaultOptions.codes);
  const [group, setGroup] = useState(defaultOptions.group);

  useEffect(() => {
    onChange({
      ...defaultOptions,
      codes,
      group,
      transfer,
    });
  }, [
    codes,
    group,
    transfer
  ]);

  // 副词条组
  const subAttrGroup = useMemo(() => {
    return Object.keys(ArtifactSubAttrsGroupMapping).map((key) => ({
      value: key, label: ArtifactSubAttrsGroupMapping[key].name,
    }));
  }, [starLevel]);

  // 子词条列表
  const subAttrsWordList = useMemo(() => {
    const groups = ArtifactSubAttrsMapping[starLevel] ?? {};
    return (groups[group] ?? { children: [] }).children ?? [];
  }, [starLevel, group]);

  useEffect(() => {
    const r = {};
    subAttrsWordList.forEach((item) => {
      r[item.value] = 0;
    });
    setCodes(r);
  }, [strictMode, subAttrsWordList]);

  const handleSubAttrTransferModeChange = (val) => {
    setTransfer(val);
  };

  const handleSubAttrWordItemCountChange = (wordItemValue) => (val) => {
    let sum = 0;
    Object.keys(codes).forEach((key) => {
      if (key === wordItemValue) return;
      sum += codes[key];
    });
    // 严格模式判定
    if (strictMode) {
      if (sum + val > ArtifactSubAttrCateMaxLimitation[starLevel]) {
        return;
      }
    }
    const r = { ...codes };
    r[wordItemValue] = val;
    setCodes(r);
  };

  const handleSubAttrGroupChange = (val) => {
    setGroup(val);
    // const { meta = { children: [] } } = option;
    // const rItems = {};
    // meta.children.forEach((child) => {
    //   rItems[child.value] = 0;
    // });
    // r[index].items = rItems;
    // setSubAttrList(r);
  };

  return <>
    <Row gutter={16}>
      <Col span={8}>
        <Form.Item label={`词条${index + 1}`}>
          <Select
            options={subAttrGroup}
            value={group}
            onSelect={handleSubAttrGroupChange}
          />
        </Form.Item>
      </Col>
      <Col span={8}>
        <Form.Item>
          <Space>
            <Switch checked={transfer} onChange={handleSubAttrTransferModeChange} checkedChildren="开启" unCheckedChildren="关闭" />
            翻译模式
            <Tooltip title="开启后，可以通过输入具体的数值来推测词条">
              <QuestionCircleFilled />
            </Tooltip>
          </Space>
        </Form.Item>
      </Col>
    </Row>
    {(!transfer && group) ? <Row gutter={16}>
      {subAttrsWordList.map((wordItem) => {
        return <Col xxl={6} lg={12} md={12} sm={12} xs={12} key={wordItem.value}>
          <Form.Item label={wordItem.label}>
            <InputNumber min={0} onChange={handleSubAttrWordItemCountChange(wordItem.value)} style={{ width: '100%' }} value={codes[wordItem.value]} />
          </Form.Item>
        </Col>;
      })}
    </Row> : null}
  </>;
}

SubAttrInput.propTypes = {
  index: P.number.isRequired,
  defaultOptions: P.shape({
    group: P.string,
    percent: P.bool,
    codes: P.shape({}),
    value: P.string,
    transfer: P.bool, // 翻译模式：把现有的数值翻译成Item
  }).isRequired,
  strictMode: P.bool.isRequired,
  starLevel: P.number.isRequired,
  onChange: P.func.isRequired,
};

export default SubAttrInput;
