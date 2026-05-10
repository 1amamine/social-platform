import React, { useEffect, useState } from "react";
import { supabase } from "../supabase";
import "../styles/createPost.css";

import { IoClose } from "react-icons/io5";
import { FaRegBookmark } from "react-icons/fa";
import { FaImages } from "react-icons/fa6";
import { IoIosColorPalette } from "react-icons/io";

function CreatePost({ profile, close, postImage, previewImage, setNewPost }) {
  const [postContent, setPostContent] = useState("");
  const [UploadLoading, setUploadLoading] = useState(false);
  const [image, setImage] = useState(previewImage || "");
  const [rawFile, setRawFile] = useState(postImage);
  const [createMode, setCreateMode] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setImage(previewUrl);

    setRawFile(file);
  };

  const uploadImage = async (file, bucketName) => {
    if (!file) {
      return;
    }
    const fileName = `${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file);

    if (error) throw error;

    const {
      data: { publicUrl },
    } = supabase.storage.from(bucketName).getPublicUrl(fileName);

    return publicUrl;
  };

  const handleCreatePost = async () => {
    setUploadLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      let imageUrl = null;
      if (rawFile) {
        imageUrl = await uploadImage(rawFile, "posts-images");
      }

      const newPost = {
        id: crypto.randomUUID(),
        user_id: user.id,
        owner: profile.userName,
        content: postContent,
        image: imageUrl || null,
      };

      const { data, error: dbError } = await supabase
        .from("posts")
        .insert(newPost)
        .select();

      if (dbError) throw dbError;

      setUploadLoading(false);
      close();
      setNewPost(true);
    } catch (err) {
      console.error("Critical Error:", err.message);
      alert(`Action failed: ${err.message}`);
    } finally {
      setUploadLoading(false);
    }
  };
  return (
    <div className="overlay" onClick={() => close()}>
      <div
        className="create-mode-container"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="c-header">
          <button onClick={() => close()}>
            <IoClose />
          </button>
          <h3>Create post</h3>
          <button>
            <FaRegBookmark />
          </button>
        </div>
        <div className="c-body">
          <div className="content">
            <textarea
              type="text"
              placeholder="What's on your mind?"
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
            />
          </div>
          <div className="icons">
            <input
              id="image-icon"
              type="file"
              accept="image"
              onChange={(e) => handleImageChange(e)}
              hidden
            />
            <label>
              <IoIosColorPalette />
            </label>
            <label htmlFor="image-icon">
              <FaImages />
            </label>
            {image && (
              <div className="image-div">
                <img src={image} alt="image" />
                <div className="removeImageIcon" onClick={() => setImage("")}>
                  <IoClose />
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="c-footer">
          <button
            onClick={() => handleCreatePost()}
            disabled={!postContent.trim() && !image}
            className={postContent.trim() || image ? "active" : ""}
          >
            {UploadLoading ? <div className="spinner"></div> : "Post"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreatePost;
