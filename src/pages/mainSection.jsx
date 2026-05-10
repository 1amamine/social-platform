import React, { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "../supabase";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useFollowData } from "./useFollowData";
import "../styles/mainSection.css";
import CreatePost from "./createPost";

import { FaImages } from "react-icons/fa6";
import { IoIosColorPalette } from "react-icons/io";

import PostDisplay from "./postDisplay";
import PostCard from "./postCard";

function MainSection({ profile, posts, loading, setNewPost, ...postProps }) {
  const [postImage, setPostImage] = useState("");
  const [previewImage, setPreviewImage] = useState("");
  const [selectedPost, setSelectedPost] = useState(null);
  const [showCreateCard, setshowCreateCard] = useState(false);

  const openCreateCard = (stat, e) => {
    const image = e.target.files[0];
    const previewUrl = URL.createObjectURL(image);
    setshowCreateCard(stat);
    setPreviewImage(previewUrl);
    setPostImage(image);
  };

  const closeCreateCard = () => {
    if (previewImage) {
      URL.revokeObjectURL(previewImage);
    }
    setshowCreateCard(false);
    setPreviewImage(null);
    setPostImage(null);
  };

  return (
    <div className="main-section-container">
      <div className="header">
        <div className="headerSection">
          <div className="active">For you</div>
        </div>
        <div className="headerSection">Following</div>
      </div>
      {showCreateCard && (
        <CreatePost
          profile={profile}
          close={() => closeCreateCard()}
          postImage={postImage}
          previewImage={previewImage}
          setNewPost={setNewPost}
        />
      )}
      {selectedPost && (
        <PostDisplay
          profile={profile}
          post={selectedPost.post}
          owner={selectedPost.owner}
          close={() => setSelectedPost(null)}
        />
      )}
      <div className="createSection">
        <div className="pic" onClick={() => openProfile(profile.id)}>
          {loading ? (
            <Skeleton
              circle
              width={43}
              height={43}
              baseColor="#414a58"
              highlightColor="#545f72"
            />
          ) : (
            <img src={profile?.image} alt="preview" />
          )}
        </div>
        <div className="placeholder" onClick={() => setshowCreateCard(true)}>
          What's on your mind!
        </div>
        <div className="icon">
          <input id="color-input" type="color" hidden />
          <label htmlFor="color-input">
            <IoIosColorPalette />
          </label>
        </div>
        <div className="icon">
          <input
            id="image-icon"
            type="file"
            accept="image"
            onChange={(e) => openCreateCard(true, e)}
            hidden
          />
          <label htmlFor="image-icon">
            <FaImages />
          </label>
        </div>
      </div>
      {loading ? (
        <div className="posts-container">
          <Skeleton
            rectangle
            width={"100%"}
            height={200}
            baseColor="#414a58"
            highlightColor="#545f72"
          />
          <Skeleton
            rectangle
            width={"100%"}
            height={200}
            baseColor="#414a58"
            highlightColor="#545f72"
          />
          <Skeleton
            rectangle
            width={"100%"}
            height={200}
            baseColor="#414a58"
            highlightColor="#545f72"
          />
        </div>
      ) : (
        <div className="posts-container">
          {posts.map((post) => (
            <PostCard
              post={post}
              profile={profile}
              onComment={setSelectedPost}
              {...postProps}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default MainSection;
