import React from 'react';
import { Provider } from 'react-redux';
import ReactDOM from 'react-dom/client';
import './styles/index.scss';
import App from './views/App';
import reportWebVitals from './reportWebVitals';
import zhCN from 'antd/es/locale/zh_CN';
import { ConfigProvider } from 'antd';
import store from './store';
import './utils/socket';
import dayjs  from 'dayjs';
import 'dayjs/locale/zh-cn';
import * as dayjsDuration from 'dayjs/plugin/duration';

dayjs.extend(dayjsDuration);
dayjs.locale('zh-cn');

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Provider store={store}>
    <ConfigProvider locale={zhCN}>
      <App />
    </ConfigProvider>
  </Provider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
