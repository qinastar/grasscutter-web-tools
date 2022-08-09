import React, { useState } from 'react';
import {
  Button, message, Modal, Space, Table, Tag
} from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { useResizeDetector } from 'react-resize-detector';
import { SpawnFavListReducer } from '@/store/profiles';

const typeNameMap = {
  animal: '生物',
  monster: '野怪',
  npc: 'NPC',
};

function SpawnFavList() {
  const dispatch = useDispatch();
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const isWSConnected = useSelector((state) => state.system?.systemInfo?.isConnected);
  const favList = useSelector((state) => state?.profiles?.spawnFavList?.local ?? []);
  const { ref: containerRef, height: containerHeight } = useResizeDetector();

  const handleRemove = (id) => () => {
    dispatch(SpawnFavListReducer.actions.removeLocal(id));
  };

  const tableColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 70,
    },
    {
      title: '名称',
      dataIndex: 'name',
      render: (_, row) => {
        return <Space>
          <span>[{typeNameMap[row.type]}]{row.name}, {row.count}, lv{row.level}</span>
          {row.forUser ? <Tag color="yellow"> @{row.forUser}</Tag> : ''}
        </Space>;
      },
    },
    {
      title: '操作',
      dataIndex: 'operation',
      width: 70,
      render: (_, row) => {
        return <Button type="text" danger onClick={handleRemove(row.id)}>删除</Button>;
      },
    }
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
  };

  const runAllCmd = () => {
    selectedRowKeys.map((id) => {
      const t = favList.find((item) => item.id === id);
      if (t && t.command) {
        window.GCManageClient.sendCMD(t.command);
      }
    });
  };

  const batchRunCommand = () => {
    if (!window.GCManageClient.isConnected()) {
      message.error('服务器未连接，无法发送');
      return;
    }
    if (selectedRowKeys.length > 10) {
      Modal.confirm({
        title: '操作确认',
        content: `当前选择了${selectedRowKeys.length}条指令，是否执行？`,
        onOk() {
          runAllCmd();
        },
        onCancel() {},
      });
    } else {
      runAllCmd();
    }
  };
  
  return <div className="fav-layout">
    <div className="title-bar">
      <div className="left-area">
        召唤预设
      </div>
      <div className="right-area">
        <Button type="primary" onClick={batchRunCommand} disabled={!isWSConnected || selectedRowKeys.length <= 0}>
          批量执行
        </Button>
      </div>
    </div>
    <div className="fav-list-container customized-scroll" ref={containerRef}>
      <Table
        rowKey="id"
        columns={tableColumns}
        pagination={false}
        scroll={{ y: containerHeight > 40 ? containerHeight - 40 : 40 }}
        dataSource={favList}
        rowSelection={rowSelection}
        size="small"
      />
    </div>
  </div>;
}

export default SpawnFavList;
