import React, { useState, useEffect } from 'react';
import { EditOutlined, CheckOutlined } from '@ant-design/icons';
import { Avatar, Card, Input, message, Spin, Modal } from 'antd';
import styles from './styles'; // Import styles
import { useDispatch } from 'react-redux';
import { getUserStories, getUserProfile } from '../../actions/profile';
import StoryList from '../StoryList';
import StoryForm from '../StoryForm'; // Import StoryForm component
import { useLocation } from 'react-router-dom'; // Import useLocation

const { Meta } = Card;

export default function Profile() {
  const user = JSON.parse(localStorage.getItem('profile'));
  const location = useLocation(); // Get the location object
  const queryParams = new URLSearchParams(location.search);
  const userId = queryParams.get('userId'); // Extract the userId query param if it exists
  const currentUser = user?.result?._id;
  const dispatch = useDispatch();
  const [id, setId] = useState(null); // Use userId if available, otherwise fallback to profile id
  const [userProfile, setUserProfile] = useState(null);
  // eslint-disable-next-line
  const [userStories, setUserStories] = useState(null);

  useEffect(() => {
    if (userId) {
      setId(userId);
    } else if (user?.result?._id) {
      setId(currentUser);
    }
  }, [userId, user, currentUser]);

  useEffect(() => {
    if (id) {
      const fetchUserData = async () => {
        const profile = await dispatch(getUserProfile(id)); // Fetch user profile
        const stories = await dispatch(getUserStories(id)); // Fetch stories

        // Store the user profile in local state
        setUserProfile(profile);
        setUserStories(stories);
      };

      fetchUserData();
    }
  }, [id, dispatch]);

  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [username, setUsername] = useState(user?.result?.username || '');
  const [bio, setBio] = useState(user?.result?.bio || '');
  const [loading, setLoading] = useState(false);

  const [isModalVisible, setIsModalVisible] = useState(false); // Modal visibility state
  const [selectedId, setSelectedId] = useState(null); // Track selected story ID

  useEffect(() => {
    document.title = 'Instaverse'; // Set document title on component mount
  }, []);

  const handleEditNameClick = () => {
    setIsEditingName(true);
  };

  const handleEditBioClick = () => {
    setIsEditingBio(true);
  };

  const handleSaveNameClick = () => {
    setIsEditingName(false);
    const updatedUser = {
      ...user,
      result: { ...user.result, username: username },
    };
    localStorage.setItem('profile', JSON.stringify(updatedUser)); // Update localStorage
    message.success('Username changed successfully!');
    // Dispatch an action if you use redux to update user information on server
  };

  const handleSaveBioClick = () => {
    setLoading(true); // Show spinner

    setTimeout(() => {
      setLoading(false); // Hide spinner after 3 seconds

      setIsEditingBio(false);
      const updatedUser = { ...user, result: { ...user.result, bio: bio } };
      localStorage.setItem('profile', JSON.stringify(updatedUser)); // Update localStorage
      message.success('Bio changed successfully!');
      // Dispatch an action if you use redux to update user information on server
    }, 3000);
  };

  const handleEditStoryClick = (storyId) => {
    setSelectedId(storyId); // Set the selected story ID
    setIsModalVisible(true); // Open the modal
  };

  const handleModalClose = () => {
    setIsModalVisible(false); // Close the modal
    setSelectedId(null); // Reset the selected story ID
  };

  return (
    <div style={styles.center} className={styles.profileContainer}>
      <style>{`.ant-spin-nested-loading { ${styles.spinOverlay} }`}</style>
      <Spin
        spinning={loading}
        tip="Updating..."
        size="large"
        className="ant-spin-nested-loading"
      >
        <Card style={{ width: '100%' }}>
          <Meta
            avatar={
              <Avatar
                src={
                  user?.result?.avatar ||
                  'https://api.dicebear.com/7.x/miniavs/svg?seed=2'
                } // Default avatar URL
                size={64} // Adjust size as needed
                style={{ backgroundColor: '#f0f0f0', borderRadius: '50%' }} // Instagram-like circular style
              />
            }
            title={
              isEditingName ? (
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onPressEnter={handleSaveNameClick} // Allow saving on Enter press
                />
              ) : (
                <div>
                  {userId ? userProfile?.username : username}{' '}
                  {!userId && !isEditingName && (
                    <EditOutlined
                      style={{ marginLeft: 8, cursor: 'pointer' }}
                      onClick={handleEditNameClick}
                    />
                  )}
                  {userId && isEditingName && (
                    <CheckOutlined
                      style={{ marginLeft: 8, cursor: 'pointer' }}
                      onClick={handleSaveNameClick}
                    />
                  )}
                </div>
              )
            }
            description={
              isEditingBio ? (
                <Input.TextArea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  onPressEnter={handleSaveBioClick} // Allow saving on Enter press
                />
              ) : (
                <div>
                  {userId ? userProfile?.bio : bio}{' '}
                  {!userId && !isEditingBio && (
                    <EditOutlined
                      style={{ marginLeft: 8, cursor: 'pointer' }}
                      onClick={handleEditBioClick}
                    />
                  )}
                  {userId && isEditingBio && (
                    <CheckOutlined
                      style={{ marginLeft: 8, cursor: 'pointer' }}
                      onClick={handleSaveBioClick}
                    />
                  )}
                </div>
              )
            }
          />
        </Card>
      </Spin>

      <div style={{ paddingTop: '20px' }}>
        <StoryList
          setSelectedId={handleEditStoryClick} // Pass edit handler to StoryList
        />
      </div>

      <Modal
        title={null} // Customize the header title
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
      >
        <StoryForm
          selectedId={selectedId}
          setSelectedId={setSelectedId}
          page={'profile'}
          handleClose={handleModalClose}
        />
      </Modal>
    </div>
  );
}
