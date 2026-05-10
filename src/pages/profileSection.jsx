import React, { useEffect, useState } from "react";
import "../styles/profileSection.css";
import { supabase } from "../supabase";
import { formatDistanceToNow } from "date-fns";

import { TbCameraPlus } from "react-icons/tb";
import { FaLocationDot } from "react-icons/fa6";
import { LiaBirthdayCakeSolid } from "react-icons/lia";
import { IoIosFootball } from "react-icons/io";

import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import FollowSection from "./followSection";
import PostCard from "./postCard";
import PostDisplay from "./postDisplay";

import { useFollowData } from "./useFollowData";

function ProfileSection({ userId, ...postProps }) {
  const [profile, setProfile] = useState(null);
  const { counts } = useFollowData(userId);
  const [showFollowing, setShowFollowing] = useState(false);
  const [showFollowers, setShowFollowers] = useState(false);

  const [loading, setLoading] = useState(true);
  const [UploadLoading, setUploadLoading] = useState(false);
  const [isEditBtn, setIsEditBtn] = useState(false);
  const [userName, setUserName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [banner, setBanner] = useState("");
  const [bannerFile, setBannerFile] = useState(null);
  const [bio, setBio] = useState("");
  const [birth, setBirth] = useState("");
  const [location, setLocation] = useState("");
  const [hobbies, setHobbies] = useState("");
  const [userPosts, setUserPosts] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [selectedBarItem, setSelectedBarItem] = useState("about");
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      setProfile(data);
      console.log(data);
      setLoading(false);
    };
    loadProfile();
  }, [userId, UploadLoading]);

  useEffect(() => {
    const checkProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user.id === userId) {
        setIsEditBtn(true);
      } else {
        setIsEditBtn(false);
      }
    };
    checkProfile();
  }, [userId]);

  useEffect(() => {
    const loadUserPosts = async () => {
      const { data, error } = await supabase
        .from("posts")
        .select(`*, comments(count), profiles(userName, image)`)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (data) setUserPosts(data);
      if (error) console.error(error);
    };
    loadUserPosts();
  }, [userId]);

  const handleImageChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    if (type === "avatar") {
      setAvatar(previewUrl);
      setAvatarFile(file);
    } else if (type === "banner") {
      setBanner(previewUrl);
      setBannerFile(file);
    }
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

  const handleChangeProfile = async () => {
    setUploadLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const avatarUrl = await uploadImage(avatarFile, "avatars");
    const bannerUrl = await uploadImage(bannerFile, "banners");

    const updates = {};

    if (userName) updates.userName = userName;
    if (avatarUrl) updates.image = avatarUrl;
    if (bannerUrl) updates.banner = bannerUrl;
    if (bio) updates.bio = bio;
    if (location) updates.location = location;
    if (birth) updates.birth = birth;
    if (hobbies) updates.hobbies = hobbies;

    updates.updated_at = new Date();

    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id)
      .select();

    console.log("Updated Data:", data);
    if (data?.length === 0) {
      console.log(
        "No rows were updated. Check if user.id matches the row ID in the DB.",
      );
    }

    if (error) {
      setUploadLoading(false);
      console.log("Error updating:", error.message);
    } else {
      setUploadLoading(false);
      console.log(user);
      setEditMode(false);
    }
  };

  const handleOpenEditMode = () => {
    setEditMode(true);
    setUserName(profile.userName);
    setBio(profile.bio);
    setLocation(profile.location);
    setBirth(profile.birth);
    setHobbies(profile.hobbies);
  };

  const handleCancel = () => {
    setUserName("");
    setBio("");
    setLocation("");
    setBirth("");
    setHobbies("");
    setAvatar("");
    setBanner("");
    setEditMode(false);
  };

  return (
    <div className="profile-section-container">
      {selectedPost && (
        <PostDisplay
          profile={profile}
          post={selectedPost.post}
          owner={selectedPost.owner}
          close={() => setSelectedPost(null)}
        />
      )}
      <div className="upper-section">
        <div className="Banner">
          {loading ? (
            <Skeleton
              rectangular
              width={"95vw"}
              height={210}
              baseColor="#414a58"
              highlightColor="#545f72"
            />
          ) : (
            <img src={banner || profile?.banner} alt="preview" />
          )}
          {editMode && (
            <div className="change-banner">
              <input
                id="banner"
                type="file"
                accept="image"
                onChange={(e) => handleImageChange(e, "banner")}
                hidden
              />
              <label htmlFor="banner">
                <TbCameraPlus />
              </label>
            </div>
          )}
        </div>
        <div className="Profile-pic">
          {loading ? (
            <Skeleton
              circle
              width={160}
              height={160}
              baseColor="#414a58"
              highlightColor="#545f72"
            />
          ) : (
            <img src={avatar || profile?.image} alt="preview" />
          )}
          {editMode && (
            <div className="change-pic">
              <input
                id="profile"
                type="file"
                accept="image"
                onChange={(e) => handleImageChange(e, "avatar")}
                hidden
              />
              <label htmlFor="profile">
                <TbCameraPlus />
              </label>
            </div>
          )}
        </div>
      </div>

      <div className="Details">
        {loading ? (
          <Skeleton
            rectangular
            width={"95vw"}
            height={200}
            baseColor="#414a58"
            highlightColor="#545f72"
          />
        ) : editMode ? (
          <div className="edit-mode">
            <div className="section">
              <label htmlFor="name">Name:</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
            </div>
            <div className="section">
              <label htmlFor="bio">Bio:</label>
              <textarea
                type="text"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>
            <div className="section">
              <label htmlFor="location">Location:</label>
              <input
                type="text"
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <div className="section">
              <label htmlFor="birth">Date of birth:</label>
              <input
                type="date"
                id="birth"
                value={birth}
                onChange={(e) => setBirth(e.target.value)}
              />
            </div>
            <div className="section">
              <label htmlFor="hobbies">Hobbies:</label>
              <input
                type="text"
                id="hobbies"
                value={hobbies}
                onChange={(e) => setHobbies(e.target.value)}
              />
            </div>
            <div className="edit">
              <button id="c-btn" onClick={() => handleCancel()}>
                Cancel
              </button>
              <button id="s-btn" onClick={() => handleChangeProfile()}>
                {UploadLoading ? <div className="spinner"></div> : "Save"}
              </button>
            </div>
          </div>
        ) : (
          <div>
            {isEditBtn && (
              <div className="edit">
                <button onClick={() => handleOpenEditMode()}>Edit</button>
              </div>
            )}

            {showFollowing && <FollowSection profile={profile} />}
            {showFollowers && <FollowSection profile={profile} />}

            <div className="name">{userName || profile?.userName}</div>
            <div className="email">{profile?.email}</div>
            <div className="bio">{bio || profile?.bio}</div>
            <div className="follow">
              <div
                className="follow-div"
                onClick={() => setShowFollowing(true)}
              >
                <div className="follow-num">{counts.following}</div>
                <div className="follow-text">Following</div>
              </div>
              <div
                className="follow-div"
                onClick={() => setShowFollowers(true)}
              >
                <div className="follow-num">{counts.followers}</div>
                <div className="follow-text">Followers</div>
              </div>
            </div>
            <div className="profile-bar">
              <div
                className={selectedBarItem === "about" ? "active" : "disactive"}
                onClick={() => setSelectedBarItem("about")}
              >
                About
              </div>
              <div
                className={selectedBarItem === "posts" ? "active" : "disactive"}
                onClick={() => setSelectedBarItem("posts")}
              >
                Posts
              </div>
              <div
                className={
                  selectedBarItem === "shares" ? "active" : "disactive"
                }
                onClick={() => setSelectedBarItem("shares")}
              >
                Shares
              </div>
              <div
                className={selectedBarItem === "likes" ? "active" : "disactive"}
                onClick={() => setSelectedBarItem("likes")}
              >
                Likes
              </div>
            </div>
            {selectedBarItem === "about" && (
              <div className="about-section">
                <div className="card">
                  <div className="icon">
                    <FaLocationDot />
                  </div>
                  <div className="title">Location</div>
                  <div className="content">{profile.location || "-"}</div>
                </div>
                <div className="card">
                  <div className="icon">
                    <LiaBirthdayCakeSolid />
                  </div>
                  <div className="title">Date of birth</div>
                  <div className="content">{profile.birth || "-"}</div>
                </div>
                <div className="card">
                  <div className="icon">
                    <IoIosFootball />
                  </div>
                  <div className="title">Hobbies</div>
                  <div className="content">{profile.hobbies || "-"}</div>
                </div>
              </div>
            )}
            {selectedBarItem === "posts" && (
              <div className="posts-section">
                {userPosts.map((post) => (
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
        )}
      </div>
    </div>
  );
}

export default ProfileSection;
