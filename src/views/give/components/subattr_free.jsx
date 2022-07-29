import React, { useState } from 'react';

const DefaultGroupEntity = {
  group: '', codes: {}, outputValue: 0,
};

function SubAttrFreeList() {
  const [subAttrList, setSubAttrList] = useState([{ ...DefaultGroupEntity }]);
  return <div />;
}

export default SubAttrFreeList;
