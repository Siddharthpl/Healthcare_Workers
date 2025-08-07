'use client';
import { useParams } from 'next/navigation';
import { useQuery } from '@apollo/client';
import { Card, Table, Typography, Space, Button, Statistic, Row, Col } from 'antd';
import { UserOutlined, ClockCircleOutlined, EnvironmentOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { GET_USER_CLOCK_HISTORY } from '@/lib/graphql/queries';
import Link from 'next/link';

const { Title, Text } = Typography;

export default function StaffHistoryPage() {
  const params = useParams();
  const staffId = params.id as string;

  const { data: historyData, loading } = useQuery(GET_USER_CLOCK_HISTORY, {
    variables: { userId: staffId },
    skip: !staffId,
  });

  const calculateTotalHours = () => {
    if (!historyData?.userClockHistory) return 0;
    
    const records = historyData.userClockHistory;
    let totalHours = 0;
    let clockInTime: Date | null = null;

    for (const record of records) {
      if (record.type === 'CLOCK_IN') {
        clockInTime = new Date(record.timestamp);
      } else if (record.type === 'CLOCK_OUT' && clockInTime) {
        const clockOutTime = new Date(record.timestamp);
        const hours = (clockOutTime.getTime() - clockInTime.getTime()) / (1000 * 60 * 60);
        totalHours += hours;
        clockInTime = null;
      }
    }

    return totalHours;
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const columns = [
    {
      title: 'Action',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <span style={{ color: type === 'CLOCK_IN' ? '#52c41a' : '#f5222d' }}>
          {type === 'CLOCK_IN' ? '🟢 Clock In' : '🔴 Clock Out'}
        </span>
      ),
    },
    {
      title: 'Date & Time',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (timestamp: string) => new Date(timestamp).toLocaleString(),
      sorter: (a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    },
    {
      title: 'Location',
      key: 'location',
      render: (record: any) => (
        record.latitude && record.longitude ? (
          <div>
            <div>📍 {record.latitude.toFixed(4)}, {record.longitude.toFixed(4)}</div>
            {record.organization && (
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Distance from center: {calculateDistance(
                  record.latitude,
                  record.longitude,
                  record.organization.latitude,
                  record.organization.longitude
                ).toFixed(2)} km
              </Text>
            )}
          </div>
        ) : (
          <span style={{ color: '#999' }}>No location</span>
        )
      ),
    },
    {
      title: 'Note',
      dataIndex: 'note',
      key: 'note',
      render: (note: string) => note || <span style={{ color: '#999' }}>No note</span>,
    },
  ];

  const staffInfo = historyData?.userClockHistory?.[0]?.user;

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <Link href="/manager">
          <Button icon={<ArrowLeftOutlined />}>Back to Manager Dashboard</Button>
        </Link>
      </div>

      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col>
            <UserOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
          </Col>
          <Col flex={1}>
            <Title level={2} style={{ margin: 0 }}>
              {staffInfo?.name || staffInfo?.email || 'Staff Member'}
            </Title>
            <Text type="secondary">{staffInfo?.email}</Text>
            <br />
            <Text type="secondary">Role: {staffInfo?.role}</Text>
          </Col>
        </Row>
      </Card>

      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Total Records"
              value={historyData?.userClockHistory?.length || 0}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Total Hours"
              value={calculateTotalHours().toFixed(1)}
              suffix="hrs"
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Avg Hours/Day"
              value={historyData?.userClockHistory?.length ? (calculateTotalHours() / (historyData.userClockHistory.length / 2)).toFixed(1) : '0'}
              suffix="hrs"
              prefix={<EnvironmentOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card title={<span><ClockCircleOutlined /> Clock History</span>}>
        <Table
          columns={columns}
          dataSource={historyData?.userClockHistory || []}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 20, showSizeChanger: true }}
          scroll={{ x: 600 }}
        />
      </Card>
    </div>
  );
}
