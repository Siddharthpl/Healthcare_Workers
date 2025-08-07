"use client";

import { useUser } from '@auth0/nextjs-auth0/client';
import { useQuery } from '@apollo/client';
import { Card, List, Tag, Typography, Spin, Space, Empty } from 'antd';
import { ClockCircleOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { GET_USER_CLOCK_HISTORY } from '@/lib/graphql/queries';
import { useAppContext } from '@/contexts/AppContext';

const { Title, Text } = Typography;

function formatDateTime(timestamp: string | Date | null | undefined) {
  if (!timestamp) return '';
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  return date.toLocaleString();
}

export default function MyHistoryPage() {
  const { state } = useAppContext();
  const { user: auth0User } = useUser();
  const userId = state.user?.id || auth0User?.sub || '';

  const { data, loading } = useQuery(GET_USER_CLOCK_HISTORY, {
    variables: { userId },
    skip: !userId,
  });

  const records = data?.userClockHistory || [];

  return (
    <div className="mobile-container" style={{ maxWidth: 600, margin: '0 auto', padding: 24 }}>
      <Card title={<Space><ClockCircleOutlined /> My Recent Activity</Space>}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 20 }}>
            <Spin />
          </div>
        ) : records.length === 0 ? (
          <Empty description="No clock records yet" />
        ) : (
          <List
            dataSource={records.slice(0, 20)}
            renderItem={(record: any) => (
              <List.Item>
                <List.Item.Meta
                  avatar={
                    <Tag color={record.type === 'CLOCK_IN' ? 'green' : 'red'}>
                      {record.type.replace('_', ' ')}
                    </Tag>
                  }
                  title={
                    <Space>
                      <span>{formatDateTime(record.timestamp)}</span>
                      {record.latitude && record.longitude && (
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          <EnvironmentOutlined /> {record.latitude.toFixed(4)}, {record.longitude.toFixed(4)}
                        </Text>
                      )}
                    </Space>
                  }
                  description={record.note}
                />
              </List.Item>
            )}
            locale={{ emptyText: 'No clock records yet' }}
          />
        )}
      </Card>
    </div>
  );
}
