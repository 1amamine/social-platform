import React, { useEffect, useState } from "react";
import MainSection from "./mainSection";
import ProfileSection from "./profileSection";
import CreatePost from "./createPost";
import PostDisplay from "./postDisplay";
import SavedSection from "./savedSection";
import { Routes, Route } from "react-router-dom";
import { Link, useNavigate } from "react-router-dom";
import { useFollowData } from "./useFollowData";
import { supabase } from "../supabase";
import "../styles/dashboard.css";

import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

import { AiFillAlipayCircle } from "react-icons/ai";
import { GoHomeFill } from "react-icons/go";
import { GoHome } from "react-icons/go";
import { IoSearch } from "react-icons/io5";
import { IoPersonCircleOutline } from "react-icons/io5";
import { IoPersonCircle } from "react-icons/io5";
import { IoBookmarkOutline } from "react-icons/io5";
import { IoBookmark } from "react-icons/io5";
import { IoMdNotificationsOutline } from "react-icons/io";
import { IoMdNotifications } from "react-icons/io";
import { MdOutlineCreate } from "react-icons/md";
import { MdCreate } from "react-icons/md";
import NotifsSection from "./notifsSection";

function Dashboard() {
  const [profile, setProfile] = useState(null);
  const [refresh, setRefresh] = useState(false);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState([]);
  const [likes, setLikes] = useState(null);
  const [saved, setSaved] = useState([]);
  const [posts, setPosts] = useState([]);
  const [showCreateCard, setshowCreateCard] = useState(false);
  const [profileClicked, setProfileClicked] = useState(false);
  const [newSave, setNewSave] = useState(false);
  const [newPost, setNewPost] = useState(false);
  const [activeSection, setActiveSection] = useState(() => {
    return localStorage.getItem("activeSection") || "main";
  });
  const [selectedUserId, setSelectedUserId] = useState(
    localStorage.getItem("selectedUserId") || null,
  );
  const { followingList, followersList, onFollow, followLoading } =
    useFollowData(profile?.id);
  const fakeProfile1 = {
    id: "6f61d4e3-bd2a-4bed-b947-134037255ca6",
    userName: "kilyan Mbappé",
    email: "kilyanmbappe@gmail.com",
    image:
      "https://media2.ledevoir.com/images_galerie/originale_2721306_2044152/image.jpg?crop=3%3A2%2Csmart&width=1440",
  };
  const fakeProfile2 = {
    id: "2896b513-2350-449c-978f-2312901acbe9",
    userName: "Leonardo DiCaprio",
    email: "dicaprio@gmailcom",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Leonardo_DiCaprio_2014.jpg/250px-Leonardo_DiCaprio_2014.jpg",
  };
  const fakeProfile3 = {
    id: "ad47dbf1-e575-4141-934e-7ff18366b24b",
    userName: "ElGrandeToto",
    email: "toto@gmail.com",
    image:
      "https://www.festivalkenitra.ma/_next/image?url=https%3A%2F%2Fcdn.sanity.io%2Fimages%2Ff1a5ojps%2Fproduction%2Fac8519b03f187ec8e4b8ed51625f4c0085297ea0-4000x6000.jpg%3Frect%3D0%2C100%2C4000%2C4000%26w%3D1600%26h%3D1600%26fit%3Dmax%26auto%3Dformat&w=3840&q=75",
  };

  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem("activeSection", activeSection);
  }, [activeSection]);

  useEffect(() => {
    const initializeDashboard = async () => {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const [profileResponse, postsResponse, likesResponse, savesResponse] =
        await Promise.all([
          supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
          supabase
            .from("posts")
            .select(
              `
              id,
              created_at,
              content,
              image,
              likes,
              comments(count),
              profiles (id, userName, image)
        `,
            )
            .order("created_at", { ascending: false })
            .limit(10),
          supabase.from("liked").select("post_id").eq("user_id", user.id),
          supabase.from("saved").select("post_id").eq("user_id", user.id),
        ]);

      if (profileResponse.data) setProfile(profileResponse.data);
      if (postsResponse.data) {
        setPosts(postsResponse.data);
        const initialMap = [];
        postsResponse.data.forEach((post) => {
          initialMap[post.id] = post.likes;
        });
        setLikes(initialMap);
      }
      if (likesResponse.data)
        setLiked(likesResponse.data.map((item) => item.post_id));
      setLoading(false);
      if (savesResponse.data)
        setSaved(savesResponse.data.map((item) => item.post_id));
    };

    setRefresh(false);
    initializeDashboard();
  }, [refresh]);

  const handleLogOut = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Error logging out:", error.message);
    } else {
      setProfile(null);
      navigate("/login", { replace: true });
    }
  };

  const handleNavigation = (destination) => {
    setActiveSection(destination);
    if (destination === "saved") setNewSave(false);
    if (destination === "main") {
      setRefresh(true);
      setNewPost(false);
    }
  };

  const openProfile = (userId) => {
    setSelectedUserId(userId);
    setActiveSection("profile");
    localStorage.setItem("selectedUserId", userId);
  };

  const handleSave = (state) => {
    setNewSave(state);
  };

  const [selectedPost, setSelectedPost] = useState(null);

  const postProps = {
    profile,
    openProfile,
    loading,
    followingList,
    onFollow,
    likes,
    setLikes,
    liked,
    setLiked,
    saved,
    setSaved,
    handleSave,
    setSelectedPost,
  };

  return (
    <div className="container">
      <div className="main">
        <div className="left-section">
          <div
            className="menuItem"
            id="main"
            onClick={() => handleNavigation("main")}
          >
            {activeSection === "main" ? (
              <div className="icon">
                <GoHomeFill size={"30px"} />
                {newPost && <span />}
              </div>
            ) : (
              <div className="icon">
                <GoHome size={"30px"} />
                {newPost && <span />}
              </div>
            )}
            <div
              className={activeSection === "main" ? "label active" : "label"}
            >
              Home
            </div>
          </div>
          <div className="menuItem" id="search">
            <IoSearch size={"30px"} />
            <div className="label">Search</div>
          </div>
          <div
            className="menuItem"
            id="saved"
            onClick={() => handleNavigation("saved")}
          >
            {activeSection === "saved" ? (
              <div className="icon">
                <IoBookmark size={"30px"} />
                {newSave && <span />}
              </div>
            ) : (
              <div className="icon">
                <IoBookmarkOutline size={"30px"} />
                {newSave && <span />}
              </div>
            )}
            <div
              className={activeSection === "saved" ? "label active" : "label"}
            >
              Saved
            </div>
          </div>
          <div
            className="menuItem"
            id="create"
            onClick={() => setshowCreateCard(true)}
          >
            <MdOutlineCreate size={"30px"} />
            <div
              className={activeSection === "create" ? "label active" : "label"}
            >
              Create
            </div>
          </div>
          <div
            className="menuItem"
            id="notifs"
            onClick={() => setActiveSection("notifications")}
          >
            <IoMdNotificationsOutline size={"30px"} />
            <div className="label">Notifications</div>
          </div>

          <div
            className="menuItem"
            id="profile"
            onClick={() => openProfile(profile.id)}
          >
            {activeSection === "profile" ? (
              <IoPersonCircle size={"30px"} />
            ) : (
              <IoPersonCircleOutline size={"30px"} />
            )}
            <div
              className={activeSection === "profile" ? "label active" : "label"}
            >
              Profile
            </div>
          </div>
          <div
            className="profile"
            onClick={() => setProfileClicked(!profileClicked)}
          >
            {loading ? (
              <Skeleton
                circle
                width={55}
                height={55}
                baseColor="#414a58"
                highlightColor="#545f72"
              />
            ) : (
              <img src={profile?.image} alt="preview" />
            )}
          </div>
          {profileClicked && (
            <div className="profile-label">
              <div>Switch Account</div>
              <div onClick={() => handleLogOut()}>Deconnection</div>
            </div>
          )}
        </div>
        <div className="center-section">
          {selectedPost && (
            <PostDisplay
              user={profile}
              post={selectedPost.post}
              owner={selectedPost.owner}
              close={() => setSelectedPost(null)}
            />
          )}
          {showCreateCard && (
            <CreatePost
              profile={profile}
              setNewPost={setNewPost}
              close={() => setshowCreateCard(false)}
            />
          )}
          {activeSection === "main" && (
            <MainSection posts={posts} setNewPost={setNewPost} {...postProps} />
          )}
          {activeSection === "profile" && (
            <ProfileSection
              userId={selectedUserId}
              setSelectedPost={setSelectedPost}
              {...postProps}
            />
          )}
          {activeSection === "saved" && (
            <SavedSection
              posts={posts.filter((p) => saved.includes(p.id))}
              {...postProps}
            />
          )}
          {activeSection === "notifications" && <NotifsSection />}
        </div>

        <div className="right-section">
          <div className="searchBar">
            <div className="searchIcn">
              <IoSearch />
            </div>
            <input placeholder="Search"></input>
          </div>
          {followLoading ? (
            <Skeleton
              rectangle
              width={360}
              height={80}
              baseColor="#414a58"
              highlightColor="#545f72"
            />
          ) : (
            followingList.length > 0 && (
              <div className="following">
                <div className="head">
                  <div className="title">Following</div>
                </div>

                <div className="content">
                  {followingList?.map((user) => (
                    <div className="profile" key={user.following_id}>
                      <div className="profile-content">
                        <div
                          className="pic"
                          onClick={() => openProfile(user.following_id)}
                        >
                          <img src={user.profiles.image} alt="avatar" />
                        </div>
                        <div
                          className="name"
                          onClick={() => openProfile(user.following_id)}
                        >
                          <div className="firstName">
                            {user.profiles.userName}
                          </div>
                          <div className="secondName">
                            {user.profiles.email}
                          </div>
                        </div>
                      </div>
                      <button
                        className="btn"
                        onClick={() => onFollow(user.following_id)}
                      >
                        Unfollow
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )
          )}

          <div className="suggestions">
            <div className="head">
              <div className="title">Suggestions</div>
            </div>
            <div className="content">
              {!followingList.some(
                (item) => item.following_id === fakeProfile1.id,
              ) && (
                <div className="profile">
                  <div className="profile-content">
                    <div
                      className="pic"
                      onClick={() => openProfile(fakeProfile1.id)}
                    >
                      <img src={fakeProfile1.image} alt="avatar" />
                    </div>
                    <div className="name">
                      <div
                        className="firstName"
                        onClick={() => openProfile(fakeProfile1.id)}
                      >
                        {fakeProfile1.userName}
                      </div>
                      <div className="secondName">{fakeProfile1.email}</div>
                    </div>
                  </div>

                  <button
                    className="follow btn"
                    onClick={() => onFollow(fakeProfile1.id)}
                  >
                    Follow
                  </button>
                </div>
              )}

              {!followingList.some(
                (item) => item.following_id === fakeProfile2.id,
              ) && (
                <div className="profile">
                  <div className="profile-content">
                    <div
                      className="pic"
                      onClick={() => openProfile(fakeProfile2.id)}
                    >
                      <img src={fakeProfile2.image} alt="avatar" />
                    </div>
                    <div className="name">
                      <div
                        className="firstName"
                        onClick={() => openProfile(fakeProfile2.id)}
                      >
                        {fakeProfile2.userName}
                      </div>
                      <div className="secondName">{fakeProfile2.email}</div>
                    </div>
                  </div>

                  <button
                    className="follow btn"
                    onClick={() => onFollow(fakeProfile2.id)}
                  >
                    Follow
                  </button>
                </div>
              )}

              {!followingList.some(
                (item) => item.following_id === fakeProfile3.id,
              ) && (
                <div className="profile">
                  <div className="profile-content">
                    <div
                      className="pic"
                      onClick={() => openProfile(fakeProfile3.id)}
                    >
                      <img src={fakeProfile3.image} alt="avatar" />
                    </div>
                    <div className="name">
                      <div
                        className="firstName"
                        onClick={() => openProfile(fakeProfile3.id)}
                      >
                        {fakeProfile3.userName}
                      </div>
                      <div className="secondName">{fakeProfile3.email}</div>
                    </div>
                  </div>

                  <button
                    className="follow btn"
                    onClick={() => onFollow(fakeProfile3.id)}
                  >
                    Follow
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
