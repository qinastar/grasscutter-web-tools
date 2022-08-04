import React, { useMemo, useState } from 'react';
import {
  Button, Col, Input, Layout, message, Popconfirm, Row, Table, Form
} from 'antd';
import { get } from 'lodash';
import { useResizeDetector } from 'react-resize-detector';
import { useDispatch, useSelector } from 'react-redux';
import {
  DeleteFilled, CloseOutlined, EditOutlined, PlayCircleOutlined, SaveOutlined
} from '@ant-design/icons';
import FavCommandsDefault from '@/constants/fav_commands_default';
import { SystemFavCommandsReducer } from '@/store/profiles';

function EditableCell({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  index,
  children,
  ...restProps
}) {
  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{
            margin: 0,
          }}
          rules={[
            {
              required: true,
              message: `请输入${title}!`,
            }
          ]}
        >
          <Input />
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
}

function SystemFavPage() {
  const dispatch = useDispatch();
  const isWSConnected = useSelector((state) => state.system?.systemInfo?.isConnected);
  const { ref: containerRef, height: containerHeight } = useResizeDetector();

  const commandListLocal = useSelector((state) => state.profiles?.systemFavCommands?.local ?? []);

  const [addCommandName, setAddCommandName] = useState('');
  const [addCommandContent, setAddCommandContent] = useState('');

  const [tableForm] = Form.useForm();
  const [editingId, setEditingId] = useState(null);
  const isEditing = (record) => record.id === editingId;

  const commandsList = useMemo(() => {
    return [...FavCommandsDefault, ...commandListLocal];
  }, [commandListLocal]);

  const handleAddCommand = () => {
    if (!addCommandName) {
      message.warn('请输入名称');
      return;
    }
    if (!addCommandContent) {
      message.warn('请输入指令内容');
      return;
    }
    dispatch(SystemFavCommandsReducer.actions.addCommand({
      name: addCommandName,
      command: addCommandContent,
    }));
    setAddCommandName('');
    setAddCommandContent('');
    message.success('添加成功');
  };

  const editCommandLine = (record) => () => {
    tableForm.setFieldsValue({
      name: '',
      command: '',
      ...record,
    });
    setEditingId(record.id);
  };

  const handleRemove = (ids) => () => {
    dispatch(SystemFavCommandsReducer.actions.removeCommands(ids));
  };

  const handleCancelEdit = () => {
    tableForm.setFieldsValue({
      name: '',
      command: '',
    });
    setEditingId(null);
  };

  const handleSaveEdit = (recordId) => async () => {
    try {
      const row = await tableForm.validateFields();
      dispatch(SystemFavCommandsReducer.actions.editCommand({
        id: recordId, ...row,
      }));
      message.success('保存成功');
      handleCancelEdit();
    } catch (errInfo) {
      message.warn(`校验失败：${get(errInfo, 'errorFields.0.errors.0')}`);
    }
  };

  // 发送指令
  const sendCommand = (cmd) => () => {
    if (!window.GCManageClient.isConnected()) {
      message.error('服务器未连接，无法发送');
      return;
    }
    if (!cmd) return;
    window.GCManageClient.sendCMD(cmd);
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
      width: 240,
      editable: true,
    },
    {
      title: '指令内容',
      dataIndex: 'command',
      editable: true,
    },
    {
      title: '操作',
      dataIndex: 'operation',
      width: 320,
      render: (text, record) => {
        const editing = isEditing(record);
        return editing
          ? <>
            <Button type="text" key="save" onClick={handleSaveEdit(record.id)}>
              <SaveOutlined /> 保存
            </Button>
            <Button type="text" danger key="cancel" onClick={handleCancelEdit}>
              <CloseOutlined /> 取消
            </Button>
          </> : <>
            <Button type="text" disabled={!isWSConnected} key="exec" onClick={sendCommand(record.command)}>
              <PlayCircleOutlined /> 执行
            </Button>
            {!record.system ? <>
              <Button type="text" key="edit" disabled={editingId} onClick={editCommandLine(record)}>
                <EditOutlined /> 修改
              </Button>
              <Popconfirm
                key="delete"
                placement="topRight"
                title="确定要删除这条记录吗？数据不可恢复"
                onConfirm={handleRemove(record.id)}
                okText="是"
                cancelText="否"
              >
                <Button type="text" danger>
                  <DeleteFilled /> 删除
                </Button>
              </Popconfirm>
            </> : null}
          </>;
      },
    }
  ];

  const mergedColumns = tableColumns.map((col) => {
    if (!col.editable) {
      return col;
    }

    return {
      ...col,
      onCell: (record) => ({
        record,
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  return <Layout.Content className="common-page-layout system-fav-page">
    <div className="main-layout">
      <div className="table-container customized-scroll" ref={containerRef}>
        <Form form={tableForm} component={false}>
          <Table
            onRow={(record) => {
              return {
                onDoubleClick: () => {
                  sendCommand(record.command)();
                },
              };
            }}
            components={{
              body: {
                cell: EditableCell,
              },
            }}
            rowKey="id"
            columns={mergedColumns}
            pagination={false}
            scroll={{ y: containerHeight > 40 ? containerHeight - 40 : 40 }}
            dataSource={commandsList}
            size="small"
          />
        </Form>
      </div>
      <div className="command-layout">
        <Row>
          <Col flex="0 0 320px">
            <Input size="large" value={addCommandName} onChange={(e) => setAddCommandName(e.target.value)} placeholder="名称" />
          </Col>
          <Col flex="1 1 auto">
            <Input size="large" value={addCommandContent} onChange={(e) => setAddCommandContent(e.target.value)} placeholder="指令内容" />
          </Col>
          <Col flex="0 0 auto">
            <Button size="large" type="primary" onClick={handleAddCommand}>新增</Button>
          </Col>
        </Row>
      </div>
    </div>
  </Layout.Content>;
}

export default SystemFavPage;
