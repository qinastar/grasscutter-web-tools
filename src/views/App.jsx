import React, { useEffect } from 'react';
import '@styles/give.scss';
import '@styles/system.scss';
import { Layout } from 'antd';
import { HomePage } from '@views/global/home';
import { AppSider } from '@views/global/sider';
import { useDispatch, useSelector } from 'react-redux';
import ConnStatusBar from '@views/global/conn_bar';
import {
  BrowserRouter, Routes, Route
} from 'react-router-dom';
import WebConsole from '@views/global/console';
import GiveArtifactsPage from '@views/give/artifacts';
import GiveWeaponPage from '@views/give/weapons';
import SystemFavPage from '@views/system/fav';
import { GrasscutterConnectionReducer } from '@/store/settings';
import { SystemInfoReducer } from '@/store/system';

function App() {
  const dispatch = useDispatch();
  const GCConnProfile = useSelector((state) => state.settings?.grasscutterConnection ?? {});

  useEffect(() => {
    window.GCManageClient.subscribe('main', (type, eventName, data) => {
      switch (type) {
        case 'connect':
          dispatch(SystemInfoReducer.actions.setConnState(true));
          dispatch(SystemInfoReducer.actions.setIsConnecting(false));
          window.GCManageClient.getSystemStatus();
          window.GCManageClient.getPlayerStatus();
          break;
        case 'disconnect':
          dispatch(SystemInfoReducer.actions.setConnState(false));
          dispatch(SystemInfoReducer.actions.setIsConnecting(eventName === 'error'));
          break;
        case 'connecting':
          dispatch(SystemInfoReducer.actions.setConnState(false));
          dispatch(SystemInfoReducer.actions.setIsConnecting(true));
          break;
        case 'message':
          if (eventName === 'BaseData') {
            dispatch(SystemInfoReducer.actions.setBaseData(data));
          } else if (eventName === 'PlayerList') {
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
    dispatch(SystemInfoReducer.actions.setConnState(false));
    dispatch(SystemInfoReducer.actions.setIsConnecting(false));
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
        <Layout.Content className="gwt-page-frame">
          <Layout.Content className="gwt-page-content">
            <Routes>
              <Route path="/" element={<HomePage startConnect={startConnect} stopConnect={stopConnect} />} />
              <Route path="/system">
                <Route path="fav" element={<SystemFavPage />} />
                <Route path="scene" element={<div>scene</div>} />
                <Route path="job" element={<div>scene</div>} />
                <Route path="account" element={<div>account</div>} />
              </Route>
              <Route path="/give">
                <Route path="artifact" element={<GiveArtifactsPage />} />
                <Route path="weapon" element={<GiveWeaponPage />} />
                <Route path="all" element={<div>all</div>} />
              </Route>
              <Route path="/avatar">
                <Route path="character" element={<div>character</div>} />
                <Route path="monster" element={<div>monster</div>} />
              </Route>
            </Routes>
          </Layout.Content>
          <WebConsole />
        </Layout.Content>
      </Layout>
    </Layout>
  </BrowserRouter>;
}

export default App;
