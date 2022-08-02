import React, { useEffect, useState, useMemo } from 'react';
import P from 'prop-types';
import {
  Col, Form, InputNumber, Row, Select, Space, Switch, Tooltip, Button, Typography
} from 'antd';
import { QuestionCircleFilled, DeleteFilled } from '@ant-design/icons';
import { isEmpty, isEqual } from 'lodash';
import { ArtifactSubAttrCateMaxLimitation, ArtifactSubAttrsExcludeByMaster } from '@/constants/artifact_limitation';
import ArtifactSubAttrsMapping from '@/constants/artifact_sub_attrs_map.json';
import ArtifactSubAttrsGroupMapping from '@/constants/artifact_sub_attrs_group_map.json';

function SubAttrInput({
  index,
  defaultOptions,
  starLevel,
  onChange,
  onRemove,
  selectedGroups,
  artifactMainAttrName,
}) {
  const [transfer, setTransfer] = useState(defaultOptions?.transfer ?? false);
  const [codes, setCodes] = useState(defaultOptions?.codes ?? {});
  const [group, setGroup] = useState(defaultOptions?.group ?? '');
  const [value, setTValue] = useState(defaultOptions?.value ?? '');
  const [outputValue, setOutputValue] = useState(0);
  const [isPercent, setIsPercent] = useState(false);

  useEffect(() => {
    onChange({
      ...defaultOptions,
      codes,
      group,
      transfer,
      outputValue,
      value,
      isPercent,
    });
  }, [
    codes,
    group,
    transfer,
    outputValue,
    value,
    isPercent
  ]);

  // 副词条组
  const subAttrGroup = useMemo(() => {
    const rejectGroup = ArtifactSubAttrsExcludeByMaster[artifactMainAttrName] || '';
    const ret = Object.keys(ArtifactSubAttrsGroupMapping).map((key) => ({
      value: key,
      label: ArtifactSubAttrsGroupMapping[key].name,
    }));
    return ret.filter((item) => (
      (!rejectGroup || (rejectGroup && rejectGroup !== item.value))
      && (item.value === group || !selectedGroups.includes(item.value))
    ));
  }, [group, starLevel, selectedGroups, artifactMainAttrName]);

  // 子词条组
  const subAttrsGroup = useMemo(() => {
    return (ArtifactSubAttrsMapping[starLevel] ?? {})[group];
  }, [starLevel, group]);

  // 子词条列表
  const subAttrsWordList = useMemo(() => {
    return subAttrsGroup?.children ?? [];
  }, [subAttrsGroup]);

  // 最大值
  const subAttrValueMax = useMemo(() => {
    return subAttrsGroup?.valueMax;
  }, [subAttrsGroup]);

  // 子词条列表变化时，重置词条
  useEffect(() => {
    let isChanged = false;
    const r = {};
    const validKeys = subAttrsWordList.map((item) => item.value);
    Object.keys(codes).forEach((key) => {
      if (validKeys.includes(key)) {
        r[key] = codes[key];
      } else {
        isChanged = true;
      }
    });
    subAttrsWordList.forEach((item) => {
      if (r[item.value] === undefined || r[item.value] === null) {
        r[item.value] = 0;
        isChanged = true;
      }
    });
    if (isChanged) {
      setCodes(r);
    }
  }, [codes, subAttrsWordList]);

  // 输出数值计算
  const outputValueCalc = useMemo(() => {
    let sum = 0;
    subAttrsWordList.forEach((word) => {
      sum += word.meta.value * codes[word.value];
    });
    return isPercent ? sum.toFixed(1) : sum;
  }, [codes, subAttrsWordList]);

  useEffect(() => {
    setOutputValue(outputValueCalc);
  }, [outputValueCalc]);

  const handleSubAttrTransferModeChange = (val) => {
    setTransfer(val);
  };

  const handleSubAttrWordItemCountChange = (wordItemValue) => (val) => {
    let sum = 0;
    Object.keys(codes).forEach((key) => {
      if (key === wordItemValue) return;
      sum += codes[key];
    });
    // 词条类型限制
    if (sum + val > ArtifactSubAttrCateMaxLimitation[starLevel]) {
      return;
    }
    const r = { ...codes };
    r[wordItemValue] = val;
    setCodes(r);
  };

  // 变更组的时候百分比重置
  useEffect(() => {
    if (group) {
      const p = ArtifactSubAttrsGroupMapping[group]?.percent ?? false;
      setIsPercent(p);
      setTValue('0');
    }
  }, [group]);

  // 推测模式数值计算
  useEffect(() => {
    if (!transfer || !value) return;
    const valueSet = subAttrsGroup?.valueSet ?? [];
    if (isEmpty(valueSet)) return;
    const targetSet = valueSet.filter(
      (item) => Math.floor(item.value * 10) <= Math.floor(value * 10)
    );
    if (targetSet.length > 0) {
      const target = targetSet[targetSet.length - 1];
      const r = {};
      subAttrsWordList.forEach((item) => {
        r[item.value] = 0;
      });
      target.codes.forEach((code) => {
        r[code]++;
      });
      setCodes(r);
    }
  }, [transfer, value, subAttrsWordList, subAttrsGroup]);

  const handleSubAttrGroupChange = (val) => {
    setGroup(val);
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
        <Space>
          <InputNumber
            disabled={!transfer}
            min={0}
            max={subAttrValueMax}
            value={value}
            onChange={(val) => setTValue(`${val}`)}
            formatter={(tValue) => (isPercent ? `${tValue}%` : tValue.replace('%', ''))}
            parser={(tValue) => tValue?.replace('%', '')}
          />
          <Typography.Text>
            最终数值： {outputValue}{isPercent ? '%' : ''}
          </Typography.Text>
        </Space>
      </Col>
      <Col span={8}>
        <Form.Item>
          <Space>
            <Switch checked={transfer} onChange={handleSubAttrTransferModeChange} checkedChildren="开启" unCheckedChildren="关闭" />
            推测模式
            <Tooltip title="开启后，可以通过输入具体的数值来推测词条">
              <QuestionCircleFilled />
            </Tooltip>
            <Button type="text" danger onClick={onRemove}>
              <DeleteFilled /> 移除词条
            </Button>
          </Space>
        </Form.Item>
      </Col>
    </Row>
    {group ? <Row gutter={16}>
      {subAttrsWordList.map((wordItem, i) => {
        const key = `sub_attr_word_${wordItem.value}_${i}`;
        return <Col xxl={6} lg={12} md={12} sm={12} xs={12} key={key}>
          <Form.Item label={wordItem.label}>
            {(!transfer)
              ? <InputNumber min={0} onChange={handleSubAttrWordItemCountChange(wordItem.value)} style={{ width: '100%' }} value={codes[wordItem.value]} />
              : <Typography.Text>
                {codes[wordItem.value]}
              </Typography.Text>}
          </Form.Item>
        </Col>;
      })}
    </Row> : null}
  </>;
}

SubAttrInput.propTypes = {
  index: P.number.isRequired,
  defaultOptions: P.shape({
    key: P.string,
    group: P.string,
    codes: P.shape({}),
    value: P.string,    // 推测模式手动填写的数值
    transfer: P.bool,   // 翻译模式：把现有的数值翻译成Item
  }).isRequired,
  starLevel: P.number.isRequired,
  artifactMainAttrName: P.string,
  onChange: P.func.isRequired,
  onRemove: P.func.isRequired,
  selectedGroups: P.arrayOf(P.string).isRequired,
};

SubAttrInput.defaultProps = {
  artifactMainAttrName: '',
};

export default SubAttrInput;
