'use client';

'use client';

import { Button, Card, Typography, Space } from 'antd';
import { LoginOutlined, GoogleOutlined, MailOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

export default function LoginPage() {
  return (
    <div className="app-container" style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh'
    }}>
      <Card 
        style={{ 
          width: '100%', 
          maxWidth: 400, 
          margin: '20px',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ 
            fontSize: '48px', 
            marginBottom: '16px',
            background: 'linear-gradient(135deg, #1890ff, #722ed1)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            🏥
          </div>
          <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
            Healthcare Clock
          </Title>
          <Paragraph style={{ color: '#666', margin: '8px 0 0 0' }}>
            Track your shifts with ease
          </Paragraph>
        </div>

        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Button
            type="primary"
            size="large"
            icon={<LoginOutlined />}
            block
            href="/api/auth/login"
            style={{ 
              height: '48px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #1890ff, #40a9ff)',
              border: 'none'
            }}
          >
            Sign In
          </Button>

          <div style={{ textAlign: 'center', margin: '16px 0' }}>
            <Paragraph style={{ color: '#999', margin: 0 }}>
              Sign in with your email or Google account
            </Paragraph>
          </div>

          <div style={{ 
            background: '#f8f9fa', 
            padding: '16px', 
            borderRadius: '8px',
            border: '1px solid #e9ecef'
          }}>
            <Title level={5} style={{ margin: '0 0 8px 0', color: '#495057' }}>
              Features:
            </Title>
            <ul style={{ margin: 0, paddingLeft: '20px', color: '#6c757d' }}>
              <li>Clock in/out with location tracking</li>
              <li>Manager dashboard with analytics</li>
              <li>Shift history and reporting</li>
              <li>Mobile-friendly interface</li>
            </ul>
          </div>
        </Space>
      </Card>
    </div>
  );
}
