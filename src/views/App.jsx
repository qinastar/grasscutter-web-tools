import React, { useEffect, useState } from 'react';
import { Layout } from 'antd';
import { HomePage } from '@views/global/home';
import { AppSider } from '@views/global/sider';
import { useDispatch, useSelector } from 'react-redux';
import { GrasscutterConnectionReducer } from '@/store/global';

function App() {
  const dispatch = useDispatch();
  const GCConnProfile = useSelector((state) => state.global?.grasscutterConnection ?? {});

  useEffect(() => {
    window.GCManageClient.subscribe('main', (type, data) => {
      switch (type) {
        case 'connect':

          break;
        default:
      }
    });
    // 自动连接
    if (GCConnProfile?.autoConn && GCConnProfile?.wssUrl) {
      window.GCManageClient.connect(GCConnProfile?.wssUrl);
    }
    return () => {
      window.GCManageClient.unsubscribe('main');
    };
  });

  const startConnect = (wssUrl, autoConn) => {
    window.GCManageClient.connect(wssUrl, () => {
      dispatch(GrasscutterConnectionReducer.actions.update({ wssUrl, autoConn }));   // 持久化conn
    });
  };

  return <Layout className="gwt-main-layout">
    <Layout.Header className="gwt-main-header">
      <div className="gwt-main-title">Grasscutter Web控制台</div>
    </Layout.Header>
    <Layout className="gwt-page-layout">
      <AppSider />
      <Layout.Content className="gwt-page-content">
        <HomePage isConnected={false} startConnect={startConnect} />
      </Layout.Content>
    </Layout>
  </Layout>;
}

export default App;
