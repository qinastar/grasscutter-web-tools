import React, { useEffect } from 'react';
import { Layout } from 'antd';
import { HomePage } from '@views/global/home';
import { AppSider } from '@views/global/sider';
import { useDispatch, useSelector } from 'react-redux';
import ConnStatusBar from '@views/global/conn_bar';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GrasscutterConnectionReducer } from '@/store/settings';
import { SystemInfoReducer } from '@/store/system';

function App() {
  const dispatch = useDispatch();
  const GCConnProfile = useSelector((state) => state.settings?.grasscutterConnection ?? {});

  useEffect(() => {
    window.GCManageClient.subscribe('main', (type, evenName, data) => {
      switch (type) {
        case 'connect':
          dispatch(SystemInfoReducer.actions.setConnState(true));
          dispatch(SystemInfoReducer.actions.setIsConnecting(false));
          window.GCManageClient.getSystemStatus();
          window.GCManageClient.getPlayerStatus();
          break;
        case 'disconnect':
          dispatch(SystemInfoReducer.actions.setConnState(false));
          dispatch(SystemInfoReducer.actions.setIsConnecting(false));
          break;
        case 'message':
          if (evenName === 'BaseData') {
            dispatch(SystemInfoReducer.actions.setBaseData(data));
          } else if (evenName === 'PlayerList') {
            dispatch(SystemInfoReducer.actions.setPlayerData(data));
          }
          break;
        default:
      }
    });
    // 自动连接
    if (
      GCConnProfile?.autoConn
      && GCConnProfile?.wssUrl
      && !window.GCManageClient.isConnecting()
      && !window.GCManageClient.isConnected()
    ) {
      dispatch(SystemInfoReducer.actions.setIsConnecting(true));
      window.GCManageClient.connect(GCConnProfile?.wssUrl);
    }
    return () => {
      window.GCManageClient.unsubscribe('main');
    };
  }, []);

  const startConnect = (wssUrl, autoConn) => {
    dispatch(SystemInfoReducer.actions.setIsConnecting(true));
    window.GCManageClient.connect(wssUrl, () => {
      dispatch(GrasscutterConnectionReducer.actions.update({ wssUrl, autoConn }));   // 持久化conn
    });
  };
  const stopConnect = () => {
    window.GCManageClient.close();
    dispatch(GrasscutterConnectionReducer.actions.update({ autoConn: false }));   // 持久化conn
  };

  return <BrowserRouter>
    <Layout className="gwt-main-layout">
      <Layout.Header className="gwt-main-header">
        <div className="gwt-header-title">Grasscutter Web控制台</div>
        <div className="gwt-header-content">
          <ConnStatusBar />
        </div>
      </Layout.Header>
      <Layout className="gwt-page-layout">
        <AppSider />
        <Layout.Content className="gwt-page-content">

          <Routes>
            <Route path="/" element={<HomePage startConnect={startConnect} stopConnect={stopConnect} />} />
            <Route path="/system">
              <Route path="fav" element={<div>fav</div>} />
              <Route path="scene" element={<div>scene</div>} />
            </Route>
          </Routes>

        </Layout.Content>
      </Layout>
    </Layout>
  </BrowserRouter>;
}

export default App;
