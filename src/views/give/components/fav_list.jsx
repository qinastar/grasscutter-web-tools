import React, { useMemo } from 'react';
import P from 'prop-types';
import {
  Avatar, Button, List, Typography, Popconfirm
} from 'antd';
import { DeleteFilled, QuestionOutlined } from '@ant-design/icons';
import VirtualList from 'rc-virtual-list';
import { useDispatch, useSelector } from 'react-redux';
import { useResizeDetector } from 'react-resize-detector';
import { get, pick } from 'lodash';
import MonaArtifactMeta from '@/constants/mona/_gen_artifact';
import { ArtifactFavListReducer } from '@/store/profiles';

function ArtifactFavList({ restoreArtifact }) {
  const dispatch = useDispatch();
  const favList = useSelector((state) => state?.profiles?.artifactFavList?.local ?? []);
  const { ref: containerRef, height: containerHeight } = useResizeDetector();

  const favListForRender = useMemo(() => {
    return favList.map((fav) => {
      const metas = get(MonaArtifactMeta, fav.artifactGroupId, {});
      return {
        ...pick(fav, ['id', 'artifactStar', 'artifactLevel']),
        ...pick(fav.meta, ['name', 'type', 'typeName', 'remark']),
        avatar: get(metas, `${fav.meta?.key}.${fav.meta?.type}.url`),
        raw: fav,
      };
    });
  }, [favList]);

  const handleRemove = (id) => () => {
    dispatch(ArtifactFavListReducer.actions.removeLocal(id));
  };

  const handleRestoreArtifact = (item) => () => {
    restoreArtifact(item.raw);
  };

  return <div className="fav-layout">
    <Typography.Title className="title" level={5}>预设圣遗物</Typography.Title>
    <div className="list-layout customized-scroll" ref={containerRef}>
      <List>
        <VirtualList
          data={favListForRender}
          height={containerHeight}
          itemHeight={47}
          itemKey="id"
        >
          {(item) => (
            <List.Item key={`${item.id}`}>
              <List.Item.Meta
                avatar={<Avatar icon={<QuestionOutlined />} />}
                title={<a onClick={handleRestoreArtifact(item)}>
                  {item.name} - {item.typeName}
                </a>}
                description={`${item.artifactStar}星, ${item.artifactLevel}级; ${item.remark}`}
              />
              <Popconfirm
                title="确定要删除这个圣遗物记录吗？数据不可恢复"
                onConfirm={handleRemove(item.id)}
                okText="是"
                cancelText="否"
              >
                <Button type="text" danger>
                  <DeleteFilled /> 删除
                </Button>
              </Popconfirm>
            </List.Item>
          )}
        </VirtualList>
      </List>
    </div>
  </div>;
}

ArtifactFavList.propTypes = {
  restoreArtifact: P.func.isRequired,
};

export default ArtifactFavList;
