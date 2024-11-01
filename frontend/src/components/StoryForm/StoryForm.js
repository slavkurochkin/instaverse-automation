import React, { useEffect, useState } from 'react';
import {
  Button,
  Card,
  Form,
  Input,
  Typography,
  Radio,
  Select,
  Checkbox,
  Progress,
} from 'antd';
import FileBase64 from 'react-file-base64';
import { useDispatch } from 'react-redux';
import styles from './styles';
import { createStory, updateStory } from '../../actions/stories';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

const { Title } = Typography;

function StoryForm({ selectedId, setSelectedId, page, handleClose }) {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const user = JSON.parse(localStorage.getItem('profile'));
  const username = user?.result?.username;
  const [uploadProgress, setUploadProgress] = useState(0); // State for tracking upload progress
  const [showProgressBar, setShowProgressBar] = useState(false); // State to control visibility of progress bar
  const [showSuccess, setShowSuccess] = useState(false); // State to control visibility of success message

  const story = useSelector((state) =>
    selectedId ? state.stories.find((story) => story._id === selectedId) : null,
  );

  useEffect(() => {
    if (story) {
      form.setFieldsValue(story);
    }
  }, [story, form]);

  const onSubmit = async (formValues) => {
    // Initiate the progress bar
    setUploadProgress(0);
    setShowProgressBar(true);

    try {
      const formData = { ...formValues, username };

      // Simulate async operation (uploading could be asynchronous)
      await new Promise((resolve) => {
        const interval = setInterval(() => {
          setUploadProgress((prevProgress) => {
            const nextProgress = prevProgress + 10; // Increment progress
            if (nextProgress >= 100) {
              clearInterval(interval);
              resolve();
              return 100;
            }
            return nextProgress;
          });
        }, 500); // Adjust timing based on your upload process
      });

      // Dispatch action to create or update story after upload
      selectedId
        ? dispatch(updateStory(selectedId, formData))
        : dispatch(createStory(formData));

      reset();
      setShowSuccess(true); // Show success message
      setTimeout(() => {
        setShowSuccess(false); // Hide success message after 500ms
      }, 1000);
      if (page === 'profile') {
        handleClose();
      }
    } catch (error) {
      console.error('Error during upload:', error);
      // Handle error scenario if needed
    } finally {
      setShowProgressBar(false); // Hide progress bar after completion
    }
  };

  const reset = () => {
    if (page !== 'profile') {
      form.resetFields();
    } else {
      handleClose();
    }
    setSelectedId(null);
  };

  if (!user) {
    return (
      <Card style={styles.formCard}>
        <Title level={4}>
          <span style={styles.formTitle}>Welcome to instaverse!</span> <br />
          Please <Link to="/authform">login</Link> or{' '}
          <Link to="/authform">register </Link> for sharing instant moments or
          ideas.
        </Title>
      </Card>
    );
  }

  return (
    <Card
      style={page === 'profile' ? null : styles.formCard}
      title={
        <Title level={4} style={styles.formTitle}>
          {selectedId ? 'Edit' : 'Share'} a story
        </Title>
      }
    >
      <Form
        form={form}
        labelCol={{
          span: 6,
        }}
        wrapperCol={{
          span: 16,
        }}
        layout="horizontal"
        onFinish={onSubmit}
      >
        <Form.Item
          name="caption"
          label="Caption"
          rules={[
            {
              required: true,
              message: 'Please enter caption',
            },
          ]}
        >
          <Input.TextArea
            allowClear
            autoSize={{
              minRows: 2,
              maxRows: 6,
            }}
          />
        </Form.Item>

        <Form.Item name="tags" label="Tags">
          <Input.TextArea
            allowClear
            autoSize={{
              minRows: 2,
              maxRows: 6,
            }}
          />
        </Form.Item>
        <Form.Item name="category" label="Category">
          <Select>
            <Select.Option value="animals">Animals</Select.Option>
            <Select.Option value="nature">Nature</Select.Option>
            <Select.Option value="portrait">Portraite</Select.Option>
            <Select.Option value="sport">Sport</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item name="device" label="Taken on:">
          <Radio.Group>
            <Radio value="phone"> Phone </Radio>
            <Radio value="camera"> Camera </Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item label="Shared on:" name="social">
          <Checkbox.Group>
            <Checkbox value="instagram">Instagram</Checkbox>
            <Checkbox value="facebook">Facebook</Checkbox>
            <Checkbox value="other">Other</Checkbox>
          </Checkbox.Group>
        </Form.Item>
        <Form.Item
          name="image"
          label="Image"
          rules={[
            {
              required: true,
              message: 'Please select the image',
            },
          ]}
        >
          <FileBase64
            type="file"
            multiple={false}
            onDone={(e) => {
              form.setFieldsValue({
                image: e.base64,
              });
            }}
          />
        </Form.Item>
        {showProgressBar && (
          <Form.Item
            wrapperCol={{
              span: 16,
              offset: 6,
            }}
          >
            <Progress percent={uploadProgress} />
          </Form.Item>
        )}
        {showSuccess && (
          <Form.Item
            wrapperCol={{
              span: 16,
              offset: 6,
            }}
          >
            <Progress percent={100} status="success" />
          </Form.Item>
        )}
        <Form.Item
          wrapperCol={{
            span: 16,
            offset: 6,
          }}
        >
          <Button type="primary" block htmlType="submit">
            Share
          </Button>
        </Form.Item>
        {!selectedId ? null : (
          <Form.Item
            wrapperCol={{
              span: 16,
              offset: 6,
            }}
          >
            <Button
              type="primary"
              block
              htmlType="button"
              danger
              onClick={reset}
            >
              Discard
            </Button>
          </Form.Item>
        )}
      </Form>
    </Card>
  );
}

export default StoryForm;
