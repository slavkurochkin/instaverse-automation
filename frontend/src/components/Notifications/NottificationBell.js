import React, { useState, useEffect } from 'react';
import { Badge, Dropdown, List, Avatar } from 'antd';
import { BellOutlined } from '@ant-design/icons';

const NotificationBell = ({ userId }) => {
  const [notifications, setNotifications] = useState([]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    console.log('Connecting to WebSocket...', userId);
    const ws = new WebSocket(`ws://localhost:8080?userId=${userId}`);

    ws.onopen = () => console.log('Successfully connected to WebSocket server');

    ws.onmessage = (event) => {
      console.log('Received message:', event.data);
      const newNotification = JSON.parse(event.data);

      // Ignore system messages like "user_back_online"
      if (newNotification.type === 'user_back_online') {
        console.log('System message ignored:', newNotification);
        return;
      }

      setNotifications((prev) => [...prev, newNotification]);
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
    if (!visible) {
      setNotifications([]); // Clear notifications when opened
    }
  };

  const menu = (
    <div
      style={{ width: 300, background: 'white', borderRadius: 8, padding: 10 }}
    >
      {notifications.length === 0 ? (
        <p style={{ textAlign: 'center' }}>No notifications</p>
      ) : (
        <List
          itemLayout="horizontal"
          dataSource={notifications}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                avatar={<Avatar>{item.username?.charAt(0)}</Avatar>}
                title={<strong>{item.username}</strong>}
                description={`Liked your post: ${item.postTitle}`}
              />
            </List.Item>
          )}
        />
      )}
    </div>
  );

  return (
    <Dropdown
      overlay={menu}
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
        >
          <BellOutlined style={{ fontSize: '24px', color: '#ffffff' }} />
        </Badge>
      </div>
    </Dropdown>
  );
};

export default NotificationBell;
