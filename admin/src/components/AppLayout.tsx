import { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Typography, Breadcrumb, Space } from 'antd';
import {
  DashboardOutlined, UserOutlined, BankOutlined,
  ShopOutlined, ControlOutlined, LogoutOutlined,
  MenuFoldOutlined, MenuUnfoldOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const { Sider, Header, Content } = Layout;
const { Text } = Typography;

const NAV = [
  { key: '/dashboard',    icon: <DashboardOutlined />, label: 'Dashboard' },
  { key: '/users',        icon: <UserOutlined />,      label: 'Users' },
  { key: '/temples',      icon: <BankOutlined />,      label: 'Temples' },
  { key: '/affiliates',   icon: <ShopOutlined />,      label: 'Affiliates' },
  { key: '/feature-flags',icon: <ControlOutlined />,   label: 'Feature Flags' },
];

const BREADCRUMB_LABELS: Record<string, string> = {
  '/dashboard':     'Dashboard',
  '/users':         'Users',
  '/temples':       'Temples',
  '/affiliates':    'Affiliates',
  '/feature-flags': 'Feature Flags',
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const logout = () => {
    localStorage.removeItem('admin_token');
    navigate('/login');
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Sidebar */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        trigger={null}
        width={220}
        style={{ background: '#3A0E1A', position: 'fixed', height: '100vh', left: 0, top: 0, zIndex: 100 }}
      >
        {/* Logo */}
        <div style={{
          height: 60, display: 'flex', alignItems: 'center',
          paddingLeft: collapsed ? 20 : 24, borderBottom: '1px solid rgba(196,154,58,0.2)',
        }}>
          <span style={{ fontSize: 20 }}>🛕</span>
          {!collapsed && (
            <Text style={{ color: '#C49A3A', fontWeight: 700, fontSize: 14, marginLeft: 10, letterSpacing: 0.3 }}>
              Temple Passport
            </Text>
          )}
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={NAV}
          onClick={({ key }) => navigate(key)}
          style={{ background: '#3A0E1A', border: 'none', marginTop: 8 }}
        />

        {/* Collapse toggle at bottom */}
        <div
          onClick={() => setCollapsed(!collapsed)}
          style={{
            position: 'absolute', bottom: 60, width: '100%',
            padding: '12px 20px', cursor: 'pointer', color: 'rgba(255,255,255,0.4)',
            display: 'flex', alignItems: 'center', gap: 8, fontSize: 16,
            transition: 'color 0.2s',
          }}
        >
          {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          {!collapsed && <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>Collapse</Text>}
        </div>
      </Sider>

      <Layout style={{ marginLeft: collapsed ? 80 : 220, transition: 'margin-left 0.2s' }}>
        {/* Header */}
        <Header style={{
          background: '#fff', padding: '0 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, zIndex: 99,
          boxShadow: '0 1px 4px rgba(74,18,32,0.08)', height: 60,
        }}>
          <Breadcrumb
            items={[
              { title: 'Admin' },
              { title: BREADCRUMB_LABELS[location.pathname] ?? '' },
            ]}
          />

          <Dropdown
            menu={{
              items: [
                { key: 'logout', icon: <LogoutOutlined />, label: 'Logout', danger: true, onClick: logout },
              ],
            }}
            placement="bottomRight"
          >
            <Space style={{ cursor: 'pointer' }}>
              <Avatar size={32} style={{ background: '#6B1A2C', fontSize: 13, fontWeight: 600 }}>AD</Avatar>
              <Text style={{ fontWeight: 500, fontSize: 13 }}>Admin</Text>
            </Space>
          </Dropdown>
        </Header>

        {/* Content */}
        <Content style={{ padding: 24, background: '#F5F0EB', minHeight: 'calc(100vh - 60px)' }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
