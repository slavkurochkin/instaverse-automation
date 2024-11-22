import React, { useState, useEffect } from 'react';
import {
  Space,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Card,
  message,
  Divider,
  Select,
} from 'antd';
import { useDispatch } from 'react-redux';
import { getUserProfiles } from '../../actions/profile';
import { updateUser, deleteUser } from '../../actions/authentication';
import {
  getStories,
  deleteUserStories,
  deleteUserComments,
} from '../../actions/stories';
import { Pie, Line } from 'react-chartjs-2'; // Import Line chart
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
} from 'chart.js';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
);

const initialData = [];

function Dashboard() {
  const [data, setData] = useState(initialData);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [allUsersData, setAllUsersData] = useState([]);
  const [storiesData, setStoriesData] = useState([]);
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUsersData = async () => {
      const profiles = await dispatch(getUserProfiles());
      setAllUsersData(profiles);
    };
    fetchUsersData();

    const fetchStoriesData = async () => {
      const stories = await dispatch(getStories());
      console.log('Fetched stories data:', stories); // Add this to check
      setStoriesData(stories);
    };
    fetchStoriesData();
  }, [dispatch]);

  const calculateTotalPosts = () => {
    const users = allUsersData.length ? allUsersData : data;
    return users.reduce((sum, user) => sum + (user.totalPosts || 0), 0);
  };

  const calculateTotalUsers = () => allUsersData.length;

  const getFavoriteStylesData = () => {
    const styleCounts = allUsersData.reduce((acc, user) => {
      const style = user.favorite_style || 'Unknown';
      acc[style] = (acc[style] || 0) + 1;
      return acc;
    }, {});

    const labels = Object.keys(styleCounts);
    const values = Object.values(styleCounts);

    return {
      labels,
      datasets: [
        {
          label: 'Favorite Styles',
          data: values,
          backgroundColor: [
            '#FF6384',
            '#36A2EB',
            '#FFCE56',
            '#4BC0C0',
            '#9966FF',
            '#FF9F40',
          ],
          hoverOffset: 4,
        },
      ],
    };
  };

  const getPostsByMonthData = () => {
    if (!storiesData || storiesData.length === 0) {
      console.log('No stories data available.');
      return { labels: [], datasets: [] }; // Return an empty chart if there are no stories
    }

    const monthCounts = storiesData.reduce((acc, story) => {
      const postDate = new Date(story.postDate); // Ensure the date is being parsed correctly
      console.log('Parsing postDate:', postDate); // Log to check if the date is valid

      if (isNaN(postDate)) {
        console.error('Invalid date:', story.postDate);
        return acc;
      }

      const month = postDate.toLocaleString('default', {
        month: 'long',
        year: 'numeric',
      });
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});

    // If no months are counted, return empty data
    if (Object.keys(monthCounts).length === 0) {
      console.log('No posts found for any month.');
      return { labels: [], datasets: [] };
    }

    const sortedMonths = Object.keys(monthCounts).sort(
      (a, b) => new Date(a) - new Date(b),
    );
    const values = sortedMonths.map((month) => monthCounts[month]);

    console.log('Sorted months:', sortedMonths); // Log sorted months
    console.log('Month counts:', values); // Log counts for each month

    return {
      labels: sortedMonths,
      datasets: [
        {
          label: 'Posts by Month',
          data: values,
          borderColor: '#36A2EB',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          fill: true,
        },
      ],
    };
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleOk = () => {
    form.validateFields().then(async (values) => {
      const updatedRecord = { ...editingRecord, ...values };

      try {
        await dispatch(updateUser(updatedRecord));

        const newData = editingRecord._id
          ? allUsersData.map((item) =>
              item._id === editingRecord._id ? updatedRecord : item,
            )
          : data.map((item) =>
              item.key === editingRecord.key ? updatedRecord : item,
            );

        editingRecord._id ? setAllUsersData(newData) : setData(newData);

        setIsModalVisible(false);
        setEditingRecord(null);
        form.resetFields();
        message.success('Record updated successfully!');
      } catch (error) {
        message.error(`Failed to update record! Error: ${error.message}`);
      }
    });
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingRecord(null);
    form.resetFields();
  };

  const handleDelete = async (key, isAllUsersTable = false) => {
    try {
      await dispatch(deleteUserComments(key));
      await dispatch(deleteUserStories(key));
      await dispatch(deleteUser(key));

      const newData = isAllUsersTable
        ? allUsersData.filter((item) => item._id !== key)
        : data.filter((item) => item.key !== key);

      isAllUsersTable ? setAllUsersData(newData) : setData(newData);

      // Re-fetch stories data after deletion to update the line chart
      const updatedStories = await dispatch(getStories());
      setStoriesData(updatedStories); // Update stories data in the state

      message.success('Record deleted successfully!');
    } catch (error) {
      message.error(`Failed to delete record! Error: ${error.message}`);
    }
  };

  const renderActions = (record, isAllUsersTable = false) => (
    <Space size="middle">
      <Button onClick={() => handleEdit(record, isAllUsersTable)}>Edit</Button>
      <Button
        danger
        onClick={() => {
          if (record.role !== 'admin') {
            // Check if the user is not an admin
            Modal.confirm({
              title: 'Are you sure you want to delete this user?',
              content: 'This will remove all user posts and comments',
              okText: 'Delete', // Change 'OK' to 'Delete'
              okType: 'danger', // Apply 'danger' type to make the button red
              onOk: () =>
                handleDelete(
                  isAllUsersTable ? record._id : record.key,
                  isAllUsersTable,
                ),
            });
          }
        }}
        disabled={record.role === 'admin'} // Disable the button if the role is 'admin'
      >
        Delete
      </Button>
    </Space>
  );

  const usersTableColumns = [
    { title: 'Username', dataIndex: 'username', key: 'username' },
    { title: 'Role', dataIndex: 'role', key: 'role' },
    { title: 'Age', dataIndex: 'age', key: 'age' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    {
      title: 'Favorite Style',
      dataIndex: 'favorite_style',
      key: 'favorite_style',
      render: (text) => text || 'N/A',
    },
    {
      title: 'Bio',
      dataIndex: 'bio',
      key: 'bio',
      render: (text) => text || 'N/A',
    },
    {
      title: 'Total Posts',
      dataIndex: 'totalPosts',
      key: 'totalPosts',
      render: (text) => text || 'N/A',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => renderActions(record, true),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', gap: '16px', marginBottom: 24 }}>
        <Card title="Statistics" style={{ flex: 1 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '10px',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <p>Total Users</p>
              <p
                style={{
                  fontSize: '36px',
                  fontWeight: 'bold',
                  margin: 0,
                }}
              >
                {calculateTotalUsers()}
              </p>
            </div>
            <Divider
              type="vertical"
              style={{ height: '100%', margin: '0 10px' }}
            />
            <div style={{ textAlign: 'center' }}>
              <p>Total Posts</p>
              <p
                style={{
                  fontSize: '36px',
                  fontWeight: 'bold',
                  margin: 0,
                }}
              >
                {calculateTotalPosts()}
              </p>
            </div>
          </div>
        </Card>

        <Card title="Favorite Styles Distribution" style={{ flex: 2 }}>
          <Pie data={getFavoriteStylesData()} />
        </Card>
        <Card title="Posts by Month" style={{ flex: 3 }}>
          <Line data={getPostsByMonthData()} />
        </Card>
      </div>

      <Modal
        title="Edit User"
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, message: 'Please input the email!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true, message: 'Please input the username!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="age"
            label="Age"
            rules={[{ required: true, message: 'Please input the age!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="bio"
            label="Bio"
            rules={[{ required: true, message: 'Please input the bio!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="favorite_style"
            rules={[
              {
                required: true,
                message: 'Please select a category',
              },
            ]}
          >
            <Select placeholder="favorite style">
              <Select.Option value="animals">Animals</Select.Option>
              <Select.Option value="nature">Nature</Select.Option>
              <Select.Option value="portrait">Portrait</Select.Option>
              <Select.Option value="sport">Sport</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Card title="All Users Data" style={{ marginTop: 24 }}>
        <Table
          columns={usersTableColumns}
          dataSource={allUsersData}
          rowKey="_id"
          pagination={{ pageSize: 5 }}
        />
      </Card>
    </div>
  );
}

export default Dashboard;
