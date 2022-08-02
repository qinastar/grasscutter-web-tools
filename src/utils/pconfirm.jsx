import React, { useState, useImperativeHandle, forwardRef } from 'react';
import {
  Modal, Typography, Input, message
} from 'antd';
import { noop } from 'lodash';
import P from 'prop-types';

const noopOk = () => true;

const PromptConfirm = forwardRef((props, ref) => {
  const {
    placeholder, maxLength, messageText, requireInput, onOk = noopOk, onCancel = noop, title,
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
      <Input maxLength={maxLength} value={userInputText} onChange={(e) => setUserInputText(e.target.value)} placeholder={placeholder || `请输入内容(${maxLength}字以内)`} />
    </Modal>
  );
});

PromptConfirm.propTypes = {
  title: P.string,
  messageText: P.string,
  requireInput: P.bool,
  onOk: P.func,
  onCancel: P.func,
  maxLength: P.number,
  placeholder: P.string,
};

PromptConfirm.defaultProps = {
  title: '确认操作',
  messageText: '',
  requireInput: false,
  onOk: noopOk,
  onCancel: noop,
  maxLength: 15,
  placeholder: '',
};

export default PromptConfirm;
