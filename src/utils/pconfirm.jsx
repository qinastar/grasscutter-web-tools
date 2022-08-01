import React, { useState, useImperativeHandle, forwardRef } from 'react';
import {
  Modal, Typography, Input, message
} from 'antd';
import { noop } from 'lodash';
import P from 'prop-types';

const noopOk = () => true;

function PromptConfirm(props, ref) {
  const {
    messageText, requireInput, onOk = noopOk, onCancel = noop, title,
  } = props;
  const [visible, setVisible] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [userInputText, setUserInputText] = useState('');

  useImperativeHandle(ref, () => ({
    showModal: () => {
      setUserInputText('');
      setVisible(true);
    },
  }));
  const handleOk = () => {
    if (requireInput && !userInputText.trim()) {
      message.error('请输入内容');
      return;
    }
    setConfirmLoading(true);
    const ret = onOk(userInputText);
    if (ret instanceof Promise) {
      ret.then(() => {
        setUserInputText('');
        setVisible(false);
        setConfirmLoading(false);
      });
    } else {
      setUserInputText('');
      setVisible(false);
      setConfirmLoading(false);
    }
  };

  const handleCancel = () => {
    setVisible(false);
    onCancel();
  };

  return (
    <Modal
      title={title}
      visible={visible}
      onOk={handleOk}
      confirmLoading={confirmLoading}
      onCancel={handleCancel}
    >
      <Typography.Paragraph>
        <Typography.Text>{messageText}</Typography.Text>
      </Typography.Paragraph>
      <Input value={userInputText} onChange={(e) => setUserInputText(e.target.value)} placeholder="请输入" />
    </Modal>
  );
}

PromptConfirm.propTypes = {
  title: P.string,
  messageText: P.string,
  requireInput: P.bool,
  onOk: P.func,
  onCancel: P.func,
};

PromptConfirm.defaultProps = {
  title: '确认操作',
  messageText: '',
  requireInput: false,
  onOk: noopOk,
  onCancel: noop,
};

export default forwardRef(PromptConfirm);
