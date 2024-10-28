import React, { useState, useRef, useEffect } from 'react';
import { Space, Table, Tag, Button, Modal, Form, Input, InputNumber, Card, message } from 'antd';
import { useDispatch } from 'react-redux';
import { getUserProfiles } from '../../actions/profile';
import { updateUser, deleteUser } from "../../actions/authentication";
import { deleteUserStories, deleteUserComments } from "../../actions/stories";

import Highlighter from 'react-highlight-words';

const initialData = [
  { key: '1', name: 'John Brown', age: 32, address: '123 Main St, New York', tags: ['nature', 'portrait'], totalPosts: 64 },
  { key: '2', name: 'Jim Green', age: 42, address: '456 Elm St, London', tags: ['sport', 'animals'], totalPosts: 60 },
];

function Dashboard() {
  const [data, setData] = useState(initialData);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [allUsersData, setAllUsersData] = useState([]);
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  // Fetch user profiles from the backend
  useEffect(() => {
    const fetchUsersData = async () => {
      const profiles = await dispatch(getUserProfiles());
      setAllUsersData(profiles);
    };
    fetchUsersData();
  }, [dispatch]);

  const handleEdit = (record, isAllUsersTable = false) => {
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
          ? allUsersData.map((item) => (item._id === editingRecord._id ? updatedRecord : item))
          : data.map((item) => (item.key === editingRecord.key ? updatedRecord : item));

        editingRecord._id ? setAllUsersData(newData) : setData(newData);

        setIsModalVisible(false);
        setEditingRecord(null);
        form.resetFields();
        message.success('Record updated successfully!');
      } catch (error) {
        message.error('Failed to update record!');
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
      message.success('Record deleted successfully!');
    } catch (error) {
      message.error('Failed to delete record!');
    }
  };

  const renderActions = (record, isAllUsersTable = false) => (
    <Space size="middle">
      <Button onClick={() => handleEdit(record, isAllUsersTable)}>Edit</Button>
    <Button danger onClick={() => {
      Modal.confirm({
        title: 'Are you sure you want to delete this user?',
        content: 'This will remove all user posts and comments',
        onOk: () => handleDelete(isAllUsersTable ? record._id : record.key, isAllUsersTable),
      });
    }}>Delete</Button>
    </Space>
  );

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Age', dataIndex: 'age', key: 'age' },
    { title: 'Address', dataIndex: 'address', key: 'address' },
    {
      title: 'Tags',
      key: 'tags',
      dataIndex: 'tags',
      render: (_, { tags }) => (
        <>
          {tags.map((tag) => (
            <Tag color="blue" key={tag}>{tag}</Tag>
          ))}
        </>
      ),
    },
    { title: 'Total Posts', dataIndex: 'totalPosts', key: 'totalPosts' },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => renderActions(record),
    },
  ];

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
      dataIndex: 'stories',
      key: 'stories',
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
      <Card title="Dashboard">
        <Table columns={columns} dataSource={data} pagination={{ pageSize: 5 }} />
      </Card>

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
