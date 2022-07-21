import React from 'react';
import { Layout } from 'antd';
import { HomePage } from '@views/global/home';
import { AppSider } from '@views/global/sider';
import { useDispatch } from 'react-redux';
import { GrasscutterConnectionReducer } from '@/store/global';

function App() {
  const dispatch = useDispatch();
  const startConnect = (wssUrl, autoConn) => {
    dispatch(GrasscutterConnectionReducer.actions.update({
      wssUrl, autoConn,
    }));
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
