import React from 'react';
import { List, Typography } from 'antd';

function ArtifactFavList() {
  return <div className="fav-layout">
    <Typography.Title className="title" level={5}>预设圣遗物</Typography.Title>
    <div className="list-layout customized-scroll">
      <List />
    </div>
  </div>;
}

export default ArtifactFavList;
