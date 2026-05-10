import React, { useEffect, useState } from "react";
import "../styles/postCard.css";
import { supabase } from "../supabase";

import { IoClose } from "react-icons/io5";
import { FaRegBookmark } from "react-icons/fa";
import { IoIosSend } from "react-icons/io";

function PostDisplay({ profile, post, owner, close }) {
  const [commentContent, setCommentContent] = useState("");
  const [commentsData, setCommentsData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchComments = async () => {
      const { data, error } = await supabase
        .from("comments")
        .select(
          `post_id, 
          content,
           profiles (userName, image)`,
        )
        .eq("post_id", post.id);
      if (data) setCommentsData(data);
      if (error) console.error(error);
    };
    fetchComments();
  }, []);

  const handleComment = async () => {
    setIsLoading(true);
    const newComment = {
      id: crypto.randomUUID(),
      user_id: profile.id,
      post_id: post.id,
      content: commentContent,
    };
    const { data, error } = await supabase.from("comments").insert(newComment);
    if (data) {
      setCommentsData(data);
      console.log();
    }
    if (error) console.error(error);

    setIsLoading(false);
    setCommentContent("");
    close();
  };
  return (
    <div className="overlay" onClick={() => close()}>
      <div className="post-card-container" onClick={(e) => e.stopPropagation()}>
        <div className="p-header">
          <button onClick={() => close()}>
            <IoClose />
          </button>
          <h3>{owner}'s post</h3>
          <button>
            <FaRegBookmark />
          </button>
        </div>
        <div className="p-body">
          {post.content}
          {post.image && <img src={post.image}></img>}
          <div className="comments-container">
            {commentsData.map((comment) => (
              <div className="comment-card">
                <img src={comment.profiles.image} alt="avatar" />
                <div className="comment-details">
                  <div className="owner">{comment.profiles.userName}</div>
                  <div>{comment.content}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="p-footer">
          <img src={profile.image} alt="pic" />
          <div className="comment-area">
            <textarea
              type="text"
              placeholder="What do you think?"
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
            />
            <button
              onClick={() => handleComment()}
              disabled={!commentContent || isLoading}
              className={commentContent ? "active" : ""}
            >
              {isLoading ? <div className="spinner"></div> : <IoIosSend />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PostDisplay;
