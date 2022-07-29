import React, { useEffect, useMemo, useState } from 'react';
import P from 'prop-types';
import SubAttrInput from '@views/give/components/subattr_input';
import {
  Button, Space, Typography, message, Divider
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import {
  ArtifactSubAttrCateLimitation,
  ArtifactSubAttrFullCateNeedLevel, ArtifactSubAttrsExcludeByMaster
} from '@/constants/artifact_limitation';

const DefaultGroupEntity = {
  group: '', codes: {}, value: '', transfer: false, outputValue: 0,
};

// 以副词条为基准，可以自由选择是填词还是填
function SubAttrStrict({
  starLevel, artLevel, strictMode, onChange, artifactMainAttrName,
}) {
  const [subAttrList, setSubAttrList] = useState([{ ...DefaultGroupEntity }]);

  useEffect(() => {
    onChange(subAttrList);
  }, [subAttrList]);
  
  useEffect(() => {
    // 严格模式：限制圣遗物种类
    if (!strictMode) return;
    let validLength = ArtifactSubAttrCateLimitation[starLevel]; // 圣遗物最大词条种类数
    if (artLevel < ArtifactSubAttrFullCateNeedLevel[starLevel]) { // 如果等级不足，减掉
      validLength -= Math.floor((ArtifactSubAttrFullCateNeedLevel[starLevel] - artLevel) / 4.0);
    }
    let rList = [...subAttrList];
    if (subAttrList.length > validLength) {
      // 如果超过了当前圣遗物品质下的最多词条数，减掉
      rList = rList.slice(0, validLength);
    }
    // 移除不合法的词条
    const rejectGroup = ArtifactSubAttrsExcludeByMaster[artifactMainAttrName] || '';
    if (rejectGroup) {
      rList = rList.filter((item) => item.group !== rejectGroup);
    }

    if (rList.length < 1) {
      rList.push({ ...DefaultGroupEntity });
    }

    setSubAttrList(rList);
  }, [strictMode, starLevel, artifactMainAttrName]);

  const selectedGroups = useMemo(() => {
    return subAttrList.map((item) => item.group);
  }, [subAttrList]);

  // useEffect(() => {
  //
  // }, [starLevel]);

  // 当前等级下最大词条数
  // const maxSubAttrCount = useMemo(() => {
  //   const maxT = ArtifactUpdateTimeLimitation[starLevel];
  //   const artUpdateTimes = Math.floor(artLevel / 4.0);
  //   return maxT - artUpdateTimes;
  // }, [starLevel, artLevel]);

  const handleAddSubAttr = () => {
    if (strictMode && subAttrList.length >= ArtifactSubAttrCateLimitation[starLevel]) {
      message.error('已达到词条种类限制，如果要添加请使用自由模式');
      return;
    }
    const r = [...subAttrList];
    r.push({ ...DefaultGroupEntity });
    setSubAttrList(r);
  };

  const handleRemoveSubAttr = (index) => () => {
    const r = [...subAttrList];
    r.splice(index, 1);
    if (r.length < 1) {
      r.push({ ...DefaultGroupEntity });
    }
    setSubAttrList(r);
  };

  const handleSubAttrChange = (index) => (val) => {
    const r = [...subAttrList];
    r[index] = val;
    setSubAttrList(r);
  };

  return <>
    {subAttrList.map((subItem, index) => {
      const fKey = `subItem_${subItem.group}_${index}`;
      return <>
        <SubAttrInput
          key={fKey}
          index={index}
          defaultOptions={subItem}
          strictMode={strictMode}
          starLevel={starLevel}
          onChange={handleSubAttrChange(index)}
          onRemove={handleRemoveSubAttr(index)}
          selectedGroups={selectedGroups}
          artifactMainAttrName={artifactMainAttrName}
        />
        <Divider className="no-top-margin" />
      </>;
    })}
    <Typography.Paragraph>
      <Space>
        <Button type="primary" onClick={handleAddSubAttr}>
          <PlusOutlined /> 添加
        </Button>
      </Space>
    </Typography.Paragraph>
  </>;
}

SubAttrStrict.propTypes = {
  artLevel: P.number,
  starLevel: P.number,
  strictMode: P.bool,
  artifactMainAttrName: P.string,
  onChange: P.func.isRequired,
};

SubAttrStrict.defaultProps = {
  starLevel: 0,
  artLevel: 20,
  strictMode: true,
  artifactMainAttrName: '',
};

export default SubAttrStrict;
