'use client';

import { useState, useEffect, useRef } from 'react';
import { useLocationWithPrompt } from '@/hooks/useLocationWithPrompt';
import { 
  Card, 
  Button, 
  Input, 
  Space, 
  Typography, 
  Alert, 
  Spin, 
  List,
  Tag,
  Modal,
  Form,
  message
} from 'antd';
import { 
  ClockCircleOutlined, 
  EnvironmentOutlined,
  HistoryOutlined,
  CheckCircleOutlined,
  StopOutlined
} from '@ant-design/icons';
import { useMutation, useQuery, useLazyQuery } from '@apollo/client';
import { useAppContext } from '@/contexts/AppContext';
import { 
  CLOCK_IN_OUT, 
  IS_WITHIN_PERIMETER, 
  GET_USER_CLOCK_HISTORY,
  GET_ME 
} from '@/lib/graphql/queries';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

export default function CareWorkerDashboard() {
  const { state, actions } = useAppContext();
  const [isClockingIn, setIsClockingIn] = useState(false);
  const [note, setNote] = useState('');
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [pendingClockAction, setPendingClockAction] = useState<'CLOCK_IN' | 'CLOCK_OUT' | null>(null);

  const [clockInOut] = useMutation(CLOCK_IN_OUT, {
    refetchQueries: [GET_ME, GET_USER_CLOCK_HISTORY],
  });

  // Use local state for location to decouple from context and avoid render/query/update loop
  const [localLocation, setLocalLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [checkPerimeter, { data: perimeterData }] = useLazyQuery(IS_WITHIN_PERIMETER);

  // Use the location hook for fetching and error handling (must be before useEffect that uses setLocationError)
  const { fetchLocation, locationError, setLocationError } = useLocationWithPrompt();

  const { data: historyData, loading: historyLoading } = useQuery(GET_USER_CLOCK_HISTORY, {
    variables: { userId: state.user?.id || '' },
    skip: !state.user?.id,
  });

  // --- Automatic location detection and notification logic ---
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | null>(null);
  const [wasWithinPerimeter, setWasWithinPerimeter] = useState<boolean | null>(null);
  const geoWatchIdRef = useRef<number | null>(null);

  // Request notification permission on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      Notification.requestPermission().then(setNotificationPermission);
    }
  }, []);

  // Set up geolocation watcher for continuous updates
  useEffect(() => {
    if (!('geolocation' in navigator)) return;
    geoWatchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const location = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        };
        setLocalLocation((prev) => {
          // Only update if changed by more than 2 meters
          if (!areLocationsClose(prev, location, 2)) {
            actions.setUserLocation(location);
            return location;
          }
          return prev;
        });
      },
      (err) => {
        setLocationError?.(err.message || 'Location error');
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 20000 }
    );
    return () => {
      if (geoWatchIdRef.current !== null) {
        navigator.geolocation.clearWatch(geoWatchIdRef.current);
      }
    };
  }, [actions, setLocationError]);

  // Detect perimeter entry/exit and notify
  useEffect(() => {
    if (state.isWithinPerimeter === undefined || state.isWithinPerimeter === null) return;
    if (wasWithinPerimeter === null) {
      setWasWithinPerimeter(state.isWithinPerimeter);
      return;
    }
    // Entered perimeter
    if (!wasWithinPerimeter && state.isWithinPerimeter) {
      // Only notify if not clocked in
      if (!isCurrentlyClockedIn()) {
        if (notificationPermission === 'granted') {
          new Notification('You have entered the work perimeter. Don\'t forget to clock in!');
        } else {
          message.info('You have entered the work perimeter. Don\'t forget to clock in!');
        }
      }
    }
    // Exited perimeter
    if (wasWithinPerimeter && !state.isWithinPerimeter) {
      // Only notify if clocked in
      if (isCurrentlyClockedIn()) {
        if (notificationPermission === 'granted') {
          new Notification('You have left the work perimeter. Don\'t forget to clock out!');
        } else {
          message.info('You have left the work perimeter. Don\'t forget to clock out!');
        }
      }
    }
    setWasWithinPerimeter(state.isWithinPerimeter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.isWithinPerimeter]);
  // --- End automatic location detection and notification logic ---


  // Helper to compare locations with a tolerance (in meters)
function areLocationsClose(loc1: { latitude: number; longitude: number } | null, loc2: { latitude: number; longitude: number } | null, thresholdMeters = 2) {
  if (!loc1 || !loc2) return false;
  // Haversine formula for approximate distance
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371000; // Earth radius in meters
  const dLat = toRad(loc2.latitude - loc1.latitude);
  const dLon = toRad(loc2.longitude - loc1.longitude);
  const lat1 = toRad(loc1.latitude);
  const lat2 = toRad(loc2.latitude);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance < thresholdMeters;
}

// Persist last location between renders
const lastLocationRef = useRef<{ latitude: number | null; longitude: number | null }>({ latitude: null, longitude: null });

// Use the location hook for fetching and error handling

// (Retain fetchLocation for manual refresh or fallback, but continuous updates are now handled by geolocation watcher)


// Only check perimeter when localLocation changes
useEffect(() => {
  if (localLocation) {
    checkPerimeter({ variables: localLocation });
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [localLocation]);

// Update context only when perimeter result changes
useEffect(() => {
  if (perimeterData?.isWithinPerimeter !== undefined) {
    actions.setWithinPerimeter(perimeterData.isWithinPerimeter);
  }
}, [perimeterData, actions]);

  // Check if user is currently clocked in
  const isCurrentlyClockedIn = () => {
    if (!historyData?.userClockHistory) return false;
    
    const records = historyData.userClockHistory;
    if (records.length === 0) return false;
    
    const lastRecord = records[0]; // Most recent record
    return lastRecord.type === 'CLOCK_IN';
  };

  const handleClockAction = (action: 'CLOCK_IN' | 'CLOCK_OUT') => {
    if (action === 'CLOCK_IN' && !state.isWithinPerimeter) {
      message.error('You must be within the organization perimeter to clock in.');
      return;
    }

    setPendingClockAction(action);
    setShowNoteModal(true);
  };

  const executeClockAction = async () => {
    if (!pendingClockAction || !state.organization) return;

    setIsClockingIn(true);
    actions.setLoading(true);

    try {
      await clockInOut({
        variables: {
          input: {
            type: pendingClockAction,
            latitude: state.userLocation?.latitude,
            longitude: state.userLocation?.longitude,
            note: note.trim() || undefined,
            organizationId: state.organization.id,
          },
        },
      });

      message.success(
        pendingClockAction === 'CLOCK_IN' 
          ? 'Successfully clocked in!' 
          : 'Successfully clocked out!'
      );
      
      setNote('');
      setShowNoteModal(false);
      setPendingClockAction(null);
    } catch (error: any) {
      message.error(error.message || 'Failed to clock in/out');
    } finally {
      setIsClockingIn(false);
      actions.setLoading(false);
    }
  };

  const formatDateTime = (timestamp: string | Date | null | undefined) => {
    if (!timestamp) return "No Date";
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return "Invalid Date";
    return date.toLocaleString();
  };

  const getRecordIcon = (type: string) => {
    return type === 'CLOCK_IN' ? <CheckCircleOutlined /> : <StopOutlined />;
  };

  const getRecordColor = (type: string) => {
    return type === 'CLOCK_IN' ? 'green' : 'red';
  };

  return (
    <div className="mobile-container">
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Location Status */}
        <Card>
          <div className={`location-status ${state.isWithinPerimeter ? 'within' : 'outside'}`}>
            <EnvironmentOutlined style={{ marginRight: 8 }} />
            {state.userLocation ? (
              state.isWithinPerimeter ? (
                'You are within the work perimeter'
              ) : (
                'You are outside the work perimeter'
              )
            ) : (
              'Getting your location...'
            )}
          </div>
        </Card>

        {/* Clock In/Out Section */}
        <Card>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 600, marginBottom: 8 }}>
  <ClockCircleOutlined style={{ marginRight: 8 }} />
  Clock {isCurrentlyClockedIn() ? 'Out' : 'In'}
</div>

<div style={{ color: '#666', marginBottom: 24 }}>
  {isCurrentlyClockedIn() 
    ? 'You are currently clocked in. Click below to clock out.'
    : 'Click below to start your shift.'
  }
</div>

            <Button
              className={`clock-button ${isCurrentlyClockedIn() ? 'clock-out-button' : 'clock-in-button'}`}
              size="large"
              loading={isClockingIn}
              disabled={!isCurrentlyClockedIn() && !state.isWithinPerimeter}
              onClick={() => handleClockAction(isCurrentlyClockedIn() ? 'CLOCK_OUT' : 'CLOCK_IN')}
            >
              {isCurrentlyClockedIn() ? 'Clock Out' : 'Clock In'}
            </Button>

            {!isCurrentlyClockedIn() && !state.isWithinPerimeter && (
              <Alert
                message="You must be within the organization perimeter to clock in"
                type="warning"
                style={{ marginTop: 16 }}
              />
            )}
          </div>
        </Card>

        {/* Recent History */}
        <Card 
          title={
            <Space>
              <HistoryOutlined />
              Recent Activity
            </Space>
          }
        >
          {historyLoading ? (
            <div style={{ textAlign: 'center', padding: 20 }}>
              <Spin />
            </div>
          ) : (
            <List
              dataSource={historyData?.userClockHistory?.slice(0, 5) || []}
              renderItem={(record: any) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={getRecordIcon(record.type)}
                    title={
                      <Space>
                        <Tag color={getRecordColor(record.type)}>
                          {record.type.replace('_', ' ')}
                        </Tag>
                        <span>{formatDateTime(record.timestamp)}</span>
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
      </Space>

      {/* Note Modal */}
      <Modal
        title={`Add Note (Optional) - ${pendingClockAction?.replace('_', ' ')}`}
        open={showNoteModal}
        onOk={executeClockAction}
        onCancel={() => {
          setShowNoteModal(false);
          setPendingClockAction(null);
          setNote('');
        }}
        confirmLoading={isClockingIn}
        okText={pendingClockAction?.replace('_', ' ')}
      >
        <Form layout="vertical">
          <Form.Item label="Note (Optional)">
            <TextArea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add any notes about your shift..."
              rows={3}
              maxLength={500}
            />
          </Form.Item>
        </Form>
      </Modal>
      {/* Location Access Modal */}
      <Modal
        open={!!locationError}
        onCancel={() => setLocationError(null)}
        footer={null}
        title="Location Access Required"
        centered
      >
        <p>{locationError}</p>
        <p style={{ fontSize: 13, color: '#888' }}>
          Please enable location access in your browser or device settings, then refresh this page.
        </p>
        <Button type="primary" onClick={() => { setLocationError(null); fetchLocation(() => {}); }}>
          Try Again
        </Button>
      </Modal>
    </div>
  );
}
