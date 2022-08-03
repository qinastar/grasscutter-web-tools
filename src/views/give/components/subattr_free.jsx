import React, {
  useMemo, useState, useCallback, useEffect 
} from 'react';
import P from 'prop-types';
import {
  Row, Col, List, Tree, Typography, Button, Badge, Space
} from 'antd';
import useClick from '@react-hook/click';
import { isEmpty } from 'lodash';
import ArtifactSubAttrsRaw from '@/constants/artifact_sub_attrs_raw.json';

// {
//   groupName: '',  // 分组名称：比如 生命值百分比
//   label: '',  // 词条名称：比如 生命值百分比+10
//   value: '',  // 代码
// };

function SubAttrFreeList({ onChange, startupList }) {
  const [subAttrList, setSubAttrList] = useState([]);
  useEffect(() => {
    if (!isEmpty(startupList)) {
      setSubAttrList(startupList);
    }
  }, [startupList]);
  const handleDoubleClick = useClick('double', (e) => {
    const r = [...subAttrList];
    r.push(e.item);
    setSubAttrList(r);
  });
  const handleRemove = useCallback((index) => {
    const r = [...subAttrList];
    r.splice(index, 1);
    setSubAttrList(r);
  }, [subAttrList]);

  useEffect(() => {
    onChange(subAttrList);
  }, [subAttrList]);

  const subAttrGroupedList = useMemo(() => {
    const ret = {};
    subAttrList.forEach((item) => {
      if (!ret[item.value]) {
        ret[item.value] = {
          ...item,
          count: 0,
        };
      }
      ret[item.value].count++;
    });
    return Object.keys(ret).map((key) => {
      return { ...ret[key] };
    });
  }, [subAttrList]);

  const mSubAttrsRawTree = useMemo(() => {
    return Object.keys(ArtifactSubAttrsRaw).map((groupKey) => {
      const group = ArtifactSubAttrsRaw[groupKey];
      return {
        key: groupKey,
        title: groupKey,
        children: group.map((item) => {
          return {
            key: item.value,
            title: <span
              onClick={(e) => {
                e.item = {
                  groupName: groupKey,
                  ...item,
                };
                return handleDoubleClick(e);
              }}
            >
              [{item.value}]{item.label}
            </span>,
          };
        }),
      };
    });
  }, [ArtifactSubAttrsRaw]);
  return <>
    <Typography.Text>提示：双击项目即可添加</Typography.Text>
    <Row className="sub-attr-free-selector" gutter={16}>
      <Col flex="1 1 50%" className="customized-scroll">
        <Tree
          treeData={mSubAttrsRawTree}
        />
      </Col>
      <Col flex="1 1 50%" className="customized-scroll">
        <List
          size="small"
          itemLayout="horizontal"
          dataSource={subAttrGroupedList}
          renderItem={(item, index) => (
            <List.Item>
              <List.Item.Meta
                title={<Space>
                  <Typography.Text>[{item.value}]{item.label}</Typography.Text>
                  <Badge count={item.count} overflowCount={999} />
                </Space>}
              />
              <Button type="text" danger onClick={() => handleRemove(index)}>移除</Button>
            </List.Item>
          )}
        />
      </Col>
    </Row>
  </>;
}

SubAttrFreeList.propTypes = {
  onChange: P.func.isRequired,
};

export default SubAttrFreeList;
