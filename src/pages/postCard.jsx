import React, { useState } from "react";
import { supabase } from "../supabase";
import {
  FaRegHeart,
  FaHeart,
  FaRegComment,
  FaRegBookmark,
  FaBookmark,
} from "react-icons/fa";
import { FiSend } from "react-icons/fi";
import { formatDistanceToNow } from "date-fns";

function PostCard({
  post,
  profile,
  followingList,
  likes,
  setLikes,
  liked,
  setLiked,
  saved,
  setSaved,
  handleSave,
  onFollow,
  openProfile,
  onComment,
}) {
  const onLike = async (postId) => {
    const isLiked = liked.includes(postId);

    const newLikedArray = isLiked
      ? liked.filter((id) => id !== postId)
      : [...liked, postId];

    const newCount = isLiked ? likes[postId] - 1 : likes[postId] + 1;

    setLiked(newLikedArray);
    setLikes((prev) => ({ ...prev, [postId]: newCount }));

    if (isLiked) {
      await supabase
        .from("liked")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", profile.id);
      await supabase.from("posts").update({ likes: newCount }).eq("id", postId);
    } else {
      await supabase
        .from("liked")
        .insert({ post_id: postId, user_id: profile.id });
      await supabase.from("posts").update({ likes: newCount }).eq("id", postId);
    }
  };

  const onSave = async (postId) => {
    if (saved.includes(postId)) {
      const newSaved = saved.filter((id) => id !== postId);
      setSaved(newSaved);
      await supabase
        .from("saved")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", profile.id);
      handleSave(false);
    } else {
      setSaved((prev) => [...prev, postId]);
      await supabase
        .from("saved")
        .insert({ post_id: postId, user_id: profile.id });
      handleSave(true);
    }
  };
  return (
    <div key={post.id} className="post">
      <div className="postHeader">
        <div className="postDetails">
          <div
            className="postOwnerprfl"
            onClick={() => openProfile(post.profiles.id)}
          >
            <img src={post.profiles.image} alt="pic" />
          </div>
          <div className="postOtherDetails">
            <div className="postOwnerName">{post.profiles.userName}</div>
            <div className="postSharingTime">
              {formatDistanceToNow(new Date(post.created_at), {
                addSuffix: false,
              })}
            </div>
          </div>
          {profile.id !== post.profiles.id && (
            <div
              className={
                followingList.some(
                  (item) => item.following_id === post.profiles.id,
                )
                  ? "follow disactive"
                  : "follow active"
              }
              onClick={() => onFollow(post.profiles.id)}
            >
              {followingList.some(
                (item) => item.following_id === post.profiles.id,
              )
                ? "following"
                : "follow"}
            </div>
          )}
        </div>
        <div className="menuIcn"></div>
      </div>
      <div className="post-description">{post.content}</div>
      <div className="postContent">
        {post.image && <img src={post.image} alt="image" />}
      </div>
      <div className="postFooter">
        <div className="reactions">
          <div className="Likes">
            <div className="likeIcn" onClick={() => onLike(post.id)}>
              {liked.includes(post.id) ? (
                <FaHeart color="red" />
              ) : (
                <FaRegHeart />
              )}
            </div>
            <div className="likeNmbr">{likes[post.id]}</div>
          </div>
          <div
            className="Comments"
            onClick={() =>
              onComment({
                post: post,
                owner: post.profiles.userName,
              })
            }
          >
            <div className="commentIcn">
              <FaRegComment />
            </div>
            <div className="commentNmbr">{post.comments[0]?.count || 0}</div>
          </div>
          <div className="Share">
            <div className="shareIcn">
              <FiSend />
            </div>
            <div className="shareNmbr">301</div>
          </div>
        </div>
        <div className="saveIcn" onClick={() => onSave(post.id)}>
          {saved.includes(post.id) ? (
            <FaBookmark color="gold" />
          ) : (
            <FaRegBookmark />
          )}
        </div>
      </div>
    </div>
  );
}

export default PostCard;
