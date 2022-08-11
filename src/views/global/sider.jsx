import React from 'react';
import { Layout, Menu } from 'antd';
import {
  CloudServerOutlined,
  HomeOutlined,
  InboxOutlined,
  BugOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router';
import { UIPreferenceReducer } from '@/store/settings';

function getItem(label, key, icon, children) {
  return {
    key,
    icon,
    children,
    label,
  };
}

const navItems = [
  getItem('首页', '/', <HomeOutlined />),
  getItem('系统', '/system', <CloudServerOutlined />, [
    getItem('常用', '/system/fav'),
    getItem('任务 & 场景', '/system/scene'),
    getItem('角色', '/system/character'),
    getItem('用户', '/system/account')
  ]),
  getItem('物品', '/give', <InboxOutlined />, [
    getItem('圣遗物', '/give/artifact'),
    getItem('武器', '/give/weapon'),
    getItem('其他', '/give/all')
  ]),
  getItem('召唤生物', '/spawn', <BugOutlined />)
  // getItem('控制台', '/console', <CodeOutlined />),
  // getItem('设置', '/setting', <SettingOutlined />)
];

export function AppSider() {
  const dispatch = useDispatch();
  const uiPreferenceConf = useSelector((state) => state.settings?.uiPreference ?? {});

  const { pathname } = useLocation();
  const navigate = useNavigate();

  const handleMenuSelect = ({ key }) => {
    navigate(key);
  };

  return <Layout.Sider
    collapsible
    collapsed={uiPreferenceConf?.siderCollapsed}
    onCollapse={(value) => {
      dispatch(UIPreferenceReducer.actions.update({
        siderCollapsed: value,
      }));
    }}
  >
    <Menu
      theme="dark"
      mode="inline"
      items={navItems}
      onSelect={handleMenuSelect}
      selectedKeys={[pathname]}
      openKeys={uiPreferenceConf?.siderMenuOpenKeys ?? []}
      onOpenChange={(openKeys) => {
        dispatch(UIPreferenceReducer.actions.update({
          siderMenuOpenKeys: openKeys,
        }));
      }}
    />
  </Layout.Sider>;
}
