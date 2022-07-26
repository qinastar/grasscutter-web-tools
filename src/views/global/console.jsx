import React, {
  useEffect, useMemo, useRef, useState 
} from 'react';
import { Input, Menu, Dropdown } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { UIPreferenceReducer } from '@/store/settings';

const WhiteSpaceIcon = styled.div`
  width: 8px;
`;

function WebConsole() {
  const dispatch = useDispatch();
  const systemInfo = useSelector((state) => state.system?.systemInfo ?? {});
  const uiPreferenceConf = useSelector((state) => state.settings?.uiPreference ?? {});
  const cmdInputConfirmType = uiPreferenceConf.consoleEnterType;

  const isConnected = systemInfo?.isConnected;
  const [commandText, setCommandText] = useState('');
  const [consoleHistory, setConsoleHistory] = useState([]);
  const historyRef = useRef();

  useEffect(() => {
    setConsoleHistory([...window.GCManageClient.cmdMessageHistory]);
    window.GCManageClient.subscribe('console', (type, eventName) => {
      if (type === 'message' && eventName === 'cmd_msg') {
        setConsoleHistory([...window.GCManageClient.cmdMessageHistory]);
      }
    });
    // 获取历史消息
    return () => {
      window.GCManageClient.unsubscribe('console');
    };
  }, []);

  const historyText = useMemo(() => {
    return consoleHistory.join('\n');
  }, [consoleHistory]);

  useEffect(() => {
    if (!historyRef.current) return;
    const { current } = historyRef;
    current.scrollTop = current.scrollHeight;
  }, [historyText]);

  const sendCMD = () => {
    window.GCManageClient.sendCMD(commandText);
    setCommandText('');
  };

  const handleKeyUp = (e) => {
    let isEnter = (e.metaKey || e.ctrlKey) && (e.code === 'Enter' || e.keyCode === 13);
    if (cmdInputConfirmType === 'enter') isEnter = (e.code === 'Enter' || e.keyCode === 13);
    if (isEnter) {
      window.GCManageClient.sendCMD(commandText);
      setCommandText('');
    }
  };

  const handleSendTypeMenuClick = (item) => {
    dispatch(UIPreferenceReducer.actions.update({
      consoleEnterType: item.key,
    }));
  };

  const sendMenu = <Menu
    style={{ width: 200 }}
    onClick={handleSendTypeMenuClick}
    items={[
      {
        key: 'ctrl+enter',
        icon: cmdInputConfirmType === 'ctrl+enter' ? <CheckOutlined /> : <WhiteSpaceIcon />,
        label: `按${window?.navigator?.userAgent?.indexOf('Macintosh') < -1 ? '⌘' : 'Ctrl'}+Enter发送命令`,
      },
      {
        key: 'enter',
        icon: cmdInputConfirmType === 'enter' ? <CheckOutlined /> : <WhiteSpaceIcon />,
        label: '按Enter发送命令',
      }
    ]}
  />;

  return <div className="gwt-page-console">
    <textarea className="gwt-page-console-history" ref={historyRef} value={historyText} readOnly />
    <div className="gwt-page-console-input-group">
      <Input
        disabled={!isConnected}
        size="large"
        className="gwt-page-console-input"
        value={commandText}
        onChange={(e) => setCommandText(e.target.value)}
        onKeyDown={handleKeyUp}
        // addonAfter={<Select value={cmdInputConfirmType}>
        //   <Select.Option value="ctrl+enter">Ctrl+Enter或Cmd+Enter发送</Select.Option>
        //   <Select.Option value="enter">Enter发送</Select.Option>
        // </Select>}
      />

      <Dropdown.Button size="large" overlay={sendMenu} type="primary" onClick={sendCMD}>发送</Dropdown.Button>
    </div>
  </div>;
}

export default WebConsole;
