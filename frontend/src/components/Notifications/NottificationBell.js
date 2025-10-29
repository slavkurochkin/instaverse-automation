import React, { useState, useEffect } from 'react';
import { Badge, Dropdown, List, Avatar, Button } from 'antd';
import { BellOutlined, ClearOutlined } from '@ant-design/icons';

const NotificationBell = ({ userId }) => {
  const [notifications, setNotifications] = useState([]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    console.log('Connecting to WebSocket...', userId);
    const ws = new WebSocket(`ws://localhost:8080?userId=${userId}`);

    ws.onopen = () => console.log('Successfully connected to WebSocket server');

    ws.onmessage = (event) => {
      console.log('Received message:', event.data);
      try {
        const newNotification = JSON.parse(event.data);
        console.log('Parsed notification:', newNotification);

        // Ignore system messages like "user_back_online"
        if (newNotification.type === 'user_back_online') {
          console.log('System message ignored:', newNotification);
          return;
        }

        // Only add valid LIKE notifications
        if (
          newNotification.type === 'LIKE' &&
          newNotification.username &&
          newNotification.postTitle
        ) {
          console.log('Adding notification to list:', newNotification);
          setNotifications((prev) => {
            const updated = [...prev, newNotification];
            console.log('Updated notifications array:', updated);
            return updated;
          });
        } else {
          console.warn('Invalid notification format:', newNotification);
        }
      } catch (error) {
        console.error('Error parsing notification:', error, event.data);
      }
    };

    ws.onerror = (error) => console.error('WebSocket error:', error);
    ws.onclose = () => console.log('WebSocket connection closed');

    return () => {
      console.log('Cleaning up WebSocket connection...');
      ws.close();
    };
  }, [userId]);

  const handleBellClick = () => {
    setVisible(!visible);
    // Don't clear notifications when opening - let user see them
    // Notifications will still show in the badge count
  };

  const handleClearAll = () => {
    setNotifications([]);
    console.log('Notifications cleared');
  };

  const menu = (
    <div
      style={{ width: 300, background: 'white', borderRadius: 8, padding: 10 }}
    >
      {notifications.length === 0 ? (
        <p style={{ textAlign: 'center' }}>No notifications</p>
      ) : (
        <>
          <div style={{ marginBottom: 8, textAlign: 'right' }}>
            <Button
              type="text"
              size="small"
              icon={<ClearOutlined />}
              onClick={handleClearAll}
              style={{ fontSize: '12px' }}
            >
              Clear All
            </Button>
          </div>
          <List
            itemLayout="horizontal"
            dataSource={notifications}
            renderItem={(item) => {
              console.log('Rendering notification item:', item);
              return (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar>{item.username?.charAt(0) || '?'}</Avatar>}
                    title={<strong>{item.username || 'Unknown User'}</strong>}
                    description={`Liked your post: ${item.postTitle || 'Untitled'}`}
                  />
                </List.Item>
              );
            }}
          />
        </>
      )}
    </div>
  );

  return (
    <Dropdown
      menu={{ items: [] }}
      dropdownRender={() => menu}
      trigger={['click']}
      open={visible}
      onOpenChange={handleBellClick}
    >
      <div
        style={{
          position: 'relative',
          cursor: 'pointer',
          fontSize: '24px',
          padding: '0 10px',
        }}
      >
        <Badge
          count={visible ? 0 : notifications.length}
          overflowCount={99}
          size="small"
          showZero={false}
        >
          <BellOutlined style={{ fontSize: '24px', color: '#ffffff' }} />
        </Badge>
      </div>
    </Dropdown>
  );
};

export default NotificationBell;
