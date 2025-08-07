'use client';

import { useEffect, useState } from 'react';
import { 
  Card, 
  Typography, 
  Space, 
  Table, 
  Button, 
  InputNumber, 
  Input, 
  Form, 
  message, 
  Row, 
  Col, 
  Statistic, 
  Tabs, 
  Tag,
  Tooltip,
  Alert,
  Spin
} from 'antd';
import { useQuery, useMutation } from '@apollo/client';
import { 
  GET_CLOCKED_IN_USERS, 
  GET_DASHBOARD_STATS, 
  GET_WEEKLY_USER_STATS, 
  UPDATE_ORGANIZATION, 
  GET_ORGANIZATION, 
  GET_ALL_CLOCK_HISTORY 
} from '@/lib/graphql/queries';
import { useAppContext } from '@/contexts/AppContext';
import { 
  EnvironmentOutlined, 
  UserOutlined, 
  ClockCircleOutlined, 
  BarChartOutlined, 
  SettingOutlined, 
  TableOutlined, 
  DashboardOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined
} from '@ant-design/icons';
import { Chart, registerables } from 'chart.js';
import { Bar } from 'react-chartjs-2';

Chart.register(...registerables);

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const formatDateTime = (timestamp: string | Date | null | undefined) => {
  if (!timestamp) return "No Date";
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return "Invalid Date";
  return date.toLocaleString();
};

export default function ManagerDashboard() {
  const { state, actions } = useAppContext();
  // GraphQL queries
  const { data: clockedInData, refetch: refetchClockedIn, loading: clockedInLoading } = useQuery(GET_CLOCKED_IN_USERS);
  const { data: statsData, refetch: refetchStats, loading: statsLoading } = useQuery(GET_DASHBOARD_STATS);
  const { data: weeklyStatsData, loading: weeklyStatsLoading } = useQuery(GET_WEEKLY_USER_STATS);
  const { data: orgData, loading: orgLoading, error: orgError, refetch: refetchOrg } = useQuery(GET_ORGANIZATION);
  const { data: allClockData, loading: allClockLoading } = useQuery(GET_ALL_CLOCK_HISTORY);

  // Local state
  const [editMode, setEditMode] = useState(false);
  const [form] = Form.useForm();

  // Mutations
  const [updateOrg, { loading: updating }] = useMutation(UPDATE_ORGANIZATION, {
    refetchQueries: [GET_ORGANIZATION],
  });

  // Effects
  useEffect(() => {
    if (editMode && orgData?.organization && form && typeof form.setFieldsValue === 'function') {
      form.setFieldsValue({
        name: orgData.organization.name,
        latitude: orgData.organization.latitude,
        longitude: orgData.organization.longitude,
        radius: orgData.organization.radius / 1000, // Convert meters to km
      });
    }
  }, [editMode, orgData, form]);

  // Handlers
  const handleOrgUpdate = async (values: any) => {
    try {
      await updateOrg({
        variables: {
          input: {
            name: values.name,
            latitude: Number(values.latitude),
            longitude: Number(values.longitude),
            radius: Number(values.radius) * 1000, // Convert km to meters
          },
        },
      });
      message.success('Organization settings updated successfully!');
      setEditMode(false);
      refetchOrg();
    } catch (error: any) {
      message.error(error.message || 'Failed to update organization settings');
    }
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

  // Table columns for clocked-in staff
  const clockedInColumns = [
    {
      title: 'Staff Member',
      key: 'staff',
      render: (record: any) => (
        <Space>
          <UserOutlined />
          <div>
            <div>{record.name || record.email}</div>
            <Text type="secondary" style={{ fontSize: '12px' }}>{record.email}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag color={role === 'MANAGER' ? 'blue' : 'green'}>
          {role.replace('_', ' ')}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: any) => (
        <Button size="small" onClick={() => window.open(`/staff/${record.id}`, '_blank')}>
          View Details
        </Button>
      ),
    },
  ];

  // Table columns for all clock history
  const clockHistoryColumns = [
    {
      title: 'Staff Member',
      key: 'user',
      render: (record: any) => (
        <Space>
          <UserOutlined />
          <div>
            <div>{record.user?.name || record.user?.email}</div>
            <Text type="secondary" style={{ fontSize: '12px' }}>{record.user?.email}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Action',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={type === 'CLOCK_IN' ? 'green' : 'red'}>
          {type === 'CLOCK_IN' ? '🟢 Clock In' : '🔴 Clock Out'}
        </Tag>
      ),
    },
    {
      title: 'Date & Time',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (timestamp: string) => formatDateTime(timestamp),
      sorter: (a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    },
    {
      title: 'Location',
      key: 'location',
      render: (record: any) => (
        record.latitude && record.longitude ? (
          <div>
            <div>📍 {record.latitude.toFixed(4)}, {record.longitude.toFixed(4)}</div>
            {orgData?.organization && (
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Distance: {calculateDistance(
                  record.latitude,
                  record.longitude,
                  orgData.organization.latitude,
                  orgData.organization.longitude
                ).toFixed(2)} km from center
              </Text>
            )}
          </div>
        ) : (
          <Text type="secondary">No location data</Text>
        )
      ),
    },
    {
      title: 'Note',
      dataIndex: 'note',
      key: 'note',
      render: (note: string) => note || <Text type="secondary">No note</Text>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: any) => (
        <Button size="small" onClick={() => window.open(`/staff/${record.user?.id}`, '_blank')}>
          View Staff
        </Button>
      ),
    },
  ];

  // Chart data for weekly stats
  const chartData = {
    labels: weeklyStatsData?.weeklyUserStats?.map((u: any) => u.userName) || [],
    datasets: [
      {
        label: 'Total Hours (Last 7 Days)',
        data: weeklyStatsData?.weeklyUserStats?.map((u: any) => u.totalHours) || [],
        backgroundColor: '#1890ff',
        borderColor: '#1890ff',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Weekly Hours per Staff Member',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Hours',
        },
      },
    },
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>
        <DashboardOutlined /> Manager Dashboard
      </Title>

      <Tabs defaultActiveKey="dashboard" type="card">
        {/* Dashboard Tab */}
        <TabPane tab={<span><DashboardOutlined />Dashboard</span>} key="dashboard">
          {/* Analytics Cards */}
          <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Average Hours/Day"
                  value={statsData?.dashboardStats?.avgHoursPerDay?.toFixed(2) || '0'}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                  suffix="hrs"
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Clock-ins Today"
                  value={statsData?.dashboardStats?.dailyClockIns || 0}
                  prefix={<UserOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Total Hours (Week)"
                  value={statsData?.dashboardStats?.totalHoursThisWeek?.toFixed(2) || '0'}
                  prefix={<BarChartOutlined />}
                  valueStyle={{ color: '#722ed1' }}
                  suffix="hrs"
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Staff Currently Clocked In"
                  value={clockedInData?.clockedInUsers?.length || 0}
                  prefix={<EnvironmentOutlined />}
                  valueStyle={{ color: '#fa8c16' }}
                />
              </Card>
            </Col>
          </Row>

          {/* Weekly Hours Chart */}
          <Card title="Weekly Hours per Staff" style={{ marginBottom: '24px' }}>
            <Bar data={chartData} options={chartOptions} />
          </Card>

          {/* Currently Clocked In Staff */}
          <Card title={<span><UserOutlined /> Currently Clocked In Staff</span>}>
            <Table
              columns={clockedInColumns}
              dataSource={clockedInData?.clockedInUsers || []}
              rowKey="id"
              pagination={false}
              locale={{ emptyText: 'No staff currently clocked in' }}
            />
          </Card>
        </TabPane>

        {/* Staff Management Tab */}
        <TabPane tab={<span><TableOutlined />Staff Management</span>} key="staff">
          <Card title={<span><ClockCircleOutlined /> Complete Clock History</span>}>
            <Table
              columns={clockHistoryColumns}
              dataSource={allClockData?.allClockHistory || []}
              rowKey="id"
              pagination={{ 
                pageSize: 20, 
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} records`
              }}
              scroll={{ x: 1000 }}
              locale={{ emptyText: 'No clock records found' }}
            />
          </Card>
        </TabPane>

        {/* Settings Tab */}
        <TabPane tab={<span><SettingOutlined />Settings</span>} key="settings">
          <Card title={<span><EnvironmentOutlined /> Organization Location & Perimeter</span>}>
            {editMode ? (
              <Form
                form={form}
                layout="vertical"
                onFinish={handleOrgUpdate}
                style={{ maxWidth: 600 }}
              >
                <Alert
                  message="Perimeter Settings"
                  description="Set your organization's location and the radius within which care workers can clock in. The radius is measured in kilometers from the specified coordinates."
                  type="info"
                  showIcon
                  style={{ marginBottom: '24px' }}
                />
                
                <Form.Item 
                  name="name" 
                  label="Organization Name" 
                  rules={[{ required: true, message: 'Please enter organization name' }]}
                >
                  <Input placeholder="Enter organization name" />
                </Form.Item>
                
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item 
                      name="latitude" 
                      label="Latitude" 
                      rules={[{ required: true, message: 'Please enter latitude' }]}
                    >
                      <InputNumber 
                        style={{ width: '100%' }} 
                        step={0.0001} 
                        placeholder="e.g., 40.7128"
                        precision={6}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item 
                      name="longitude" 
                      label="Longitude" 
                      rules={[{ required: true, message: 'Please enter longitude' }]}
                    >
                      <InputNumber 
                        style={{ width: '100%' }} 
                        step={0.0001} 
                        placeholder="e.g., -74.0060"
                        precision={6}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                
                <Form.Item 
                  name="radius" 
                  label="Perimeter Radius (km)" 
                  rules={[{ required: true, message: 'Please enter radius' }]}
                >
                  <InputNumber 
                    style={{ width: '100%' }} 
                    min={0.1} 
                    max={50} 
                    step={0.1} 
                    placeholder="e.g., 2.0"
                    addonAfter="km"
                  />
                </Form.Item>
                
                <Form.Item>
                  <Space>
                    <Button 
                      type="primary" 
                      htmlType="submit" 
                      loading={updating}
                      icon={<SaveOutlined />}
                    >
                      Save Settings
                    </Button>
                    <Button 
                      onClick={() => setEditMode(false)}
                      icon={<CloseOutlined />}
                    >
                      Cancel
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            ) : (
              <div>
                {orgLoading ? (
  <div style={{ textAlign: 'center', padding: '40px' }}>
    <Spin size="large" />
  </div>
) : orgError ? (
  <div style={{ textAlign: 'center', padding: '40px' }}>
    <Text type="danger">Error loading organization settings: {orgError.message}</Text>
  </div>
) : orgData?.organization ? (
  <Space direction="vertical" size="large" style={{ width: '100%' }}>
    <Alert
      message="Current Perimeter Settings"
      description="These settings control where care workers can clock in and out."
      type="success"
      showIcon
    />
    <Row gutter={[16, 16]}>
      <Col span={12}>
        <Card size="small">
          <Statistic
            title="Organization Name"
            value={orgData.organization.name}
            valueStyle={{ fontSize: '16px' }}
          />
        </Card>
      </Col>
      <Col span={12}>
        <Card size="small">
          <Statistic
            title="Perimeter Radius"
            value={orgData.organization.radius ? (orgData.organization.radius / 1000).toFixed(2) : '0'}
            suffix="km"
            valueStyle={{ fontSize: '16px' }}
          />
        </Card>
      </Col>
      <Col span={12}>
        <Card size="small">
          <Statistic
            title="Latitude"
            value={orgData.organization.latitude?.toFixed(6) || '0'}
            valueStyle={{ fontSize: '16px' }}
          />
        </Card>
      </Col>
      <Col span={12}>
        <Card size="small">
          <Statistic
            title="Longitude"
            value={orgData.organization.longitude?.toFixed(6) || '0'}
            valueStyle={{ fontSize: '16px' }}
          />
        </Card>
      </Col>
    </Row>
    <Button 
      type="primary" 
      onClick={() => setEditMode(true)}
      icon={<EditOutlined />}
      size="large"
    >
      Edit Perimeter Settings
    </Button>
  </Space>
) : (
  <div style={{ textAlign: 'center', padding: '40px' }}>
    <Text type="secondary">No organization data found.</Text>
  </div>
)}
              </div>
            )}
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
}
