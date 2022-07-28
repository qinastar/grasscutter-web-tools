import React, { useEffect, useMemo, useState } from 'react';
import P from 'prop-types';
import {
  ArtifactSubAttrCateLimitation,
  ArtifactSubAttrFullCateNeedLevel,
  ArtifactUpdateTimeLimitation
} from '@/constants/artifact_limitation';

// 以副词条为基准，可以自由选择是填词还是填
function SubAttrSelector({ starLevel, artLevel, strictMode }) {
  const [subAttrList, setSubAttrList] = useState([]);
  
  useEffect(() => {
    // 严格模式：限制圣遗物种类
    if (!strictMode) return;
    let validLength = ArtifactSubAttrCateLimitation[starLevel]; // 圣遗物最大词条种类数
    if (artLevel < ArtifactSubAttrFullCateNeedLevel[starLevel]) { // 如果等级不足，减掉
      validLength -= Math.floor((ArtifactSubAttrFullCateNeedLevel[starLevel] - artLevel) / 4.0);
    }
    if (subAttrList.length > validLength) {
      // 如果超过了当前圣遗物品质下的最多词条数，减掉
      setSubAttrList(subAttrList.slice(0, validLength));
    }
  }, [strictMode, starLevel]);

  // 当前等级下最大词条数
  const maxSubAttrCount = useMemo(() => {
    const maxT = ArtifactUpdateTimeLimitation[starLevel];
    const artUpdateTimes = Math.floor(artLevel / 4.0);
    return maxT - artUpdateTimes;
  }, [starLevel, artLevel]);

  return <div />;
}

SubAttrSelector.propTypes = {
  artLevel: P.number,
  starLevel: P.number.isRequired,
  strictMode: P.bool,
};

SubAttrSelector.defaultProps = {
  artLevel: 20,
  strictMode: true,
};

export default SubAttrSelector;
