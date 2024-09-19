import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import StoryList from '../StoryList';
import StoryForm from "../StoryForm";
// import Tags from "../Tags";
// import StorySearch from "../StorySearch";
import { Layout } from "antd";
import styles from './styles';
import { getStories, fetchAllTags } from "../../actions/stories";

const { Sider, Content } = Layout;

const Home = () => {
    const [selectedId, setSelectedId] = useState(null);
    const dispatch = useDispatch();

    useEffect(() => {
        document.title = "Instaverse"
     }, []);
    
/** 
    if (isTagged) {
        dispatch(fetchStoriesByTag('test'));
    } else {
        dispatch(getStories());
    }
*/
    dispatch(getStories());
    dispatch(fetchAllTags());

    return (
        <Layout>
            <Sider style={styles.sider} width={400}>
                <StoryForm selectedId={selectedId} setSelectedId={setSelectedId}/>
            </Sider>
            <Content style={styles.content}>
                <StoryList setSelectedId={setSelectedId}/>
            </Content>
        </Layout>
    )
}

export default Home;