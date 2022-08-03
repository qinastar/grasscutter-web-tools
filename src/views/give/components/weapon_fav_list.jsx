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
import { WeaponFavListReducer } from '@/store/profiles';
import MonaWeaponMeta from '@/constants/mona/_gen_weapon';

const TypeNamesMap = {
  sword: '单手剑',
  claymore: '双手剑',
  polearm: '长柄武器',
  bow: '弓',
  catalyst: '法器',
};

function WeaponFavList({ onRestore }) {
  const dispatch = useDispatch();
  const favList = useSelector((state) => state?.profiles?.weaponFavList?.local ?? []);
  const { ref: containerRef, height: containerHeight } = useResizeDetector();

  const handleRemove = (id) => () => {
    dispatch(WeaponFavListReducer.actions.removeLocal(id));
  };

  const handleRestoreArtifact = (item) => () => {
    onRestore(item);
  };

  return <div className="fav-layout">
    <Typography.Title className="title" level={5}>武器预设</Typography.Title>
    <div className="list-layout customized-scroll" ref={containerRef}>
      <List>
        <VirtualList
          data={favList}
          height={containerHeight}
          itemHeight={47}
          itemKey="id"
        >
          {(item) => {
            const metas = get(MonaWeaponMeta, item.weaponKey, {});
            return <List.Item key={`${item.id}`}>
              <List.Item.Meta
                avatar={<Avatar src={metas?.url} icon={<QuestionOutlined />} />}
                title={<a onClick={handleRestoreArtifact(item)}>
                  {metas?.chs || item.weaponName}&nbsp;
                  [{item.weaponStar}星{TypeNamesMap[item.weaponType]}]
                </a>}
                description={`${item.weaponCount}个; ${item.weaponLevel}级; 精炼${item.weaponRefine}`}
              />
              <Popconfirm
                title="确定要删除这个武器预设记录吗？数据不可恢复"
                onConfirm={handleRemove(item.id)}
                okText="是"
                cancelText="否"
              >
                <Button type="text" danger>
                  <DeleteFilled /> 删除
                </Button>
              </Popconfirm>
            </List.Item>;
          }}
        </VirtualList>
      </List>
    </div>
  </div>;
}

WeaponFavList.propTypes = {
  onRestore: P.func.isRequired,
};

export default WeaponFavList;
