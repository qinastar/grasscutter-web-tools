import React from 'react';
import { Layout, Menu } from 'antd';
import {
  CloudServerOutlined,
  CodeOutlined,
  HomeOutlined,
  InboxOutlined,
  SettingOutlined,
  UserOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { GlobalNavMenuReducer } from '@/store/settings';

function getItem(label, key, icon, children) {
  return {
    key,
    icon,
    children,
    label,
  };
}

const navItems = [
  getItem('首页', 'home', <HomeOutlined />),
  getItem('系统指令', 'system', <CloudServerOutlined />, [
    getItem('常用', 'system/fav'),
    getItem('场景', 'system/scene'),
    getItem('任务', 'system/job'),
    getItem('卡池编辑器', 'system/banner'),
    getItem('用户', 'system/account')
  ]),
  getItem('物品指令', 'give', <InboxOutlined />, [
    getItem('圣遗物', 'give/artifact'),
    getItem('武器', 'give/weapon'),
    getItem('其他', 'give/all')
  ]),
  getItem('角色指令', 'avatar', <UserOutlined />, [
    getItem('原神', 'avatar/character'),
    getItem('原魔', 'avatar/monster')
  ]),
  getItem('控制台', 'console', <CodeOutlined />),
  getItem('设置', 'setting', <SettingOutlined />)
];

export function AppSider() {
  const dispatch = useDispatch();
  const globalNavMenuConf = useSelector((state) => state.settings?.globalNavMenu ?? {});

  return <Layout.Sider
    collapsible
    collapsed={globalNavMenuConf?.siderCollapsed}
    onCollapse={(value) => {
      dispatch(GlobalNavMenuReducer.actions.update({
        siderCollapsed: value,
      }));
    }}
  >
    <Menu
      theme="dark"
      mode="inline"
      items={navItems}
      openKeys={globalNavMenuConf?.menuOpenKeys ?? []}
      onOpenChange={(openKeys) => {
        dispatch(GlobalNavMenuReducer.actions.update({
          menuOpenKeys: openKeys,
        }));
      }}
    />
  </Layout.Sider>;
}
