'use client';

'use client';

import { Layout, Menu, Button, Avatar, Dropdown, Space, Typography } from 'antd';
import { 
  DashboardOutlined, 
  ClockCircleOutlined, 
  UserOutlined, 
  LogoutOutlined,
  SettingOutlined 
} from '@ant-design/icons';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useAppContext } from '@/contexts/AppContext';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const { Header } = Layout;
const { Text } = Typography;

export default function Navigation() {
  const { user: auth0User } = useUser();
  const { state } = useAppContext();
  const [selectedKey, setSelectedKey] = useState('dashboard');
  const router = useRouter();

  const userMenuItems = [
   
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Sign Out',
      onClick: () => window.location.href = '/api/auth/logout',
    },
  ];

  const menuItems = state.user?.role === 'MANAGER' 
    ? [
        {
          key: 'dashboard',
          icon: <DashboardOutlined />,
          label: 'Dashboard',
        },
        {
          key: 'staff',
          icon: <UserOutlined />,
          label: 'Staff Management',
        },
        {
          key: 'settings',
          icon: <SettingOutlined />,
          label: 'Organization Settings',
        },
      ]
    : [
        {
          key: 'clock',
          icon: <ClockCircleOutlined />,
          label: 'Clock In/Out',
        },
        {
          key: 'history',
          icon: <DashboardOutlined />,
          label: 'My History',
        },
      ];

  return (
    <Header style={{ 
      background: '#fff', 
      padding: '0 24px', 
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ 
          fontSize: '24px', 
          marginRight: '16px',
          color: '#1890ff'
        }}>
          🏥
        </div>
        <Text strong style={{ fontSize: '18px', color: '#1890ff' }}>
          Healthcare Clock
        </Text>
      </div>

      <Menu
        mode="horizontal"
        selectedKeys={[selectedKey]}
        items={menuItems}
        style={{ 
          border: 'none', 
          flex: 1, 
          justifyContent: 'center',
          minWidth: 0
        }}
        onClick={({ key }) => {
          setSelectedKey(key);
          if (key === 'history') {
            router.push('/history');
          } else if (key === 'clock') {
            router.push('/'); // Assuming clock-in/out is main page
          } else if (key === 'dashboard') {
            router.push('/');
          } else if (key === 'staff') {
            router.push('/manager');
          } else if (key === 'settings') {
            router.push('/manager'); // Or a settings page if exists
          }
        }}
      />

      <Space>
        <Text style={{ color: '#666' }}>
          {state.user?.role === 'MANAGER' ? 'Manager' : 'Care Worker'}
        </Text>
        <Dropdown
          menu={{ items: userMenuItems }}
          placement="bottomRight"
          arrow
        >
          <Button type="text" style={{ padding: '4px 8px' }}>
            <Space>
              <Avatar 
                size="small" 
                src={auth0User?.picture} 
                icon={<UserOutlined />}
              />
              <Text>{state.user?.name || auth0User?.name || 'User'}</Text>
            </Space>
          </Button>
        </Dropdown>
      </Space>
    </Header>
  );
}
