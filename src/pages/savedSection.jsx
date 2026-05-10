import React, { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";

import "../styles/savedSection.css";
import { supabase } from "../supabase";
import { FaRegHeart, FaHeart, FaRegComment } from "react-icons/fa";
import { BsThreeDots } from "react-icons/bs";
import PostCard from "./postCard";
import PostDisplay from "./postDisplay";

function SavedSection({ profile, posts, commentsNum, ...postProps }) {
  const [selectedPost, setSelectedPost] = useState(null);

  return (
    <div className="saved-section-container">
      {selectedPost && (
        <PostDisplay
          profile={profile}
          post={selectedPost.post}
          owner={selectedPost.owner}
          close={() => setSelectedPost(null)}
        />
      )}
      <div className="posts-container">
        {posts.map((post) => (
          <PostCard
            post={post}
            profile={profile}
            onComment={setSelectedPost}
            commentsNum={commentsNum}
            {...postProps}
          />
        ))}
      </div>
    </div>
  );
}

export default SavedSection;
