import React, {
  useEffect, useMemo, useRef, useState 
} from 'react';
import P from 'prop-types';
import SubAttrInput from '@views/give/components/subattr_input';
import {
  Button, message, Divider
} from 'antd';
import { PlusCircleOutlined } from '@ant-design/icons';
import { isArray, isEmpty } from 'lodash';
import {
  ArtifactSubAttrCateLimitation,
  ArtifactSubAttrFullCateNeedLevel, ArtifactSubAttrsExcludeByMaster
} from '@/constants/artifact_limitation';

const DefaultGroupEntity = {
  group: '', codes: {}, value: '', transfer: false, outputValue: 0,
};
const getDefaultGroupEntity = () => {
  return {
    key: `${Math.random()}`,
    ...DefaultGroupEntity,
  };
};

// 以副词条为基准，可以自由选择是填词还是填
function SubAttrStrict({
  starLevel, artLevel, onChange, artifactMainAttrName, startupList,
}) {
  const [subAttrList, setSubAttrList] = useState([getDefaultGroupEntity()]);
  const subAttrListRef = useRef(startupList || [getDefaultGroupEntity()]);

  useEffect(() => {
    if (!isEmpty(startupList) && isArray(startupList)) {
      subAttrListRef.current = startupList;
      setSubAttrList([...startupList]);
    }
  }, [startupList]);

  useEffect(() => {
    onChange(subAttrList);
  }, [subAttrList]);
  
  useEffect(() => {
    // console.log(artifactMainAttrName, subAttrList, 'rlist_first');
    let validLength = ArtifactSubAttrCateLimitation[starLevel];  // 圣遗物最大词条种类数
    if (artLevel < ArtifactSubAttrFullCateNeedLevel[starLevel]) { // 如果等级不足，减掉
      validLength -= Math.floor((ArtifactSubAttrFullCateNeedLevel[starLevel] - artLevel) / 4.0);
    }
    let rList = [...subAttrList];
    let changed = false;
    if (subAttrList.length > validLength) {
      // 如果超过了当前圣遗物品质下的最多词条数，减掉
      rList = rList.slice(0, validLength);
      changed = true;
    }
    // 移除不合法的词条
    const rejectGroup = ArtifactSubAttrsExcludeByMaster[artifactMainAttrName] || '';
    if (rejectGroup) {
      rList = rList.filter((item) => {
        const r = item.group !== rejectGroup;
        if (!r) { changed = true; }
        return r;
      });
    }

    if (rList.length < 1) {
      rList.push(getDefaultGroupEntity());
      changed = true;
    }
    if (changed) {
      setSubAttrList(rList);
    }
  }, [subAttrList, starLevel, artLevel, artifactMainAttrName]);

  const selectedGroups = useMemo(() => {
    return subAttrList.map((item) => item.group);
  }, [subAttrList]);

  const handleAddSubAttr = () => {
    const r = [...subAttrList];
    r.push(getDefaultGroupEntity());
    setSubAttrList(r);
  };

  const handleRemoveSubAttr = (index) => () => {
    const r = [...subAttrList];
    r.splice(index, 1);
    setSubAttrList(r);
  };

  const handleSubAttrChange = (index) => (val) => {
    const r = [...subAttrList];
    r[index] = val;
    setSubAttrList(r);
  };

  return <>
    {subAttrList.map((subItem, index) => {
      return <div key={subItem.key}>
        <SubAttrInput
          index={index}
          defaultOptions={subItem}
          starLevel={starLevel}
          onChange={handleSubAttrChange(index)}
          onRemove={handleRemoveSubAttr(index)}
          selectedGroups={selectedGroups}
          artifactMainAttrName={artifactMainAttrName}
        />
        {(index === subAttrList.length - 1)
          ? <Divider className="no-top-margin">
            <Button type="text" onClick={handleAddSubAttr} disabled={subAttrList.length >= ArtifactSubAttrCateLimitation[starLevel]}>
              <PlusCircleOutlined /> 添加
            </Button>
          </Divider>
          : <Divider className="no-top-margin" />}
      </div>;
    })}
  </>;
}

SubAttrStrict.propTypes = {
  artLevel: P.number,
  starLevel: P.number,
  startupList: P.arrayOf(P.shape({})),
  artifactMainAttrName: P.string,
  onChange: P.func.isRequired,
};

SubAttrStrict.defaultProps = {
  starLevel: 0,
  artLevel: 20,
  startupList: null,
  artifactMainAttrName: '',
};

export default SubAttrStrict;
