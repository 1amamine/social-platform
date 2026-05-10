import { useState, useEffect } from "react";
import { supabase } from "../supabase";

export function useFollowData(profileId) {
  const [followingList, setFollowingList] = useState([]);
  const [followersList, setFollowersList] = useState([]);
  const [followLoading, setFollowLoading] = useState(true);
  const [counts, setCounts] = useState({ followers: 0, following: 0 });

  useEffect(() => {
    if (!profileId) return;

    const fetchData = async () => {
      setFollowLoading(true);
      const [followingRes, followersRes, _] = await Promise.all([
        supabase
          .from("following")
          .select("following_id, profiles:following_id (id, userName, email, image)")
          .eq("user_id", profileId),
        supabase
          .from("following")
          .select("user_id, profiles:user_id (id, userName, email, image)")
          .eq("following_id", profileId),
          fetchCounts(profileId)

      ]);

      if (followingRes.data) setFollowingList(followingRes.data);
      if (followersRes.data) setFollowersList(followersRes.data);
      setFollowLoading(false);
    };

    fetchData();
  }, [profileId]);

const onFollow = async (followingId) => {
  setFollowLoading(true)
  const isCurrentlyFollowing = followingList.some(item => item.following_id === followingId);

  if (isCurrentlyFollowing) {
    setFollowingList(prev => prev.filter(item => item.following_id !== followingId));
    
    await supabase.from("following").delete()
      .eq("following_id", followingId)
      .eq("user_id", profileId);
      fetchCounts(profileId);
      setFollowLoading(false);
  } else {
    const tempItem = { following_id: followingId, profiles: {} };
    setFollowingList(prev => [...prev, tempItem]);
    console.log(tempItem)

    const { data } = await supabase.from("following")
      .insert({ user_id: profileId, following_id: followingId })
      .select(`following_id, profiles:following_id (userName, email, image)`)
      .single();

    if (data) {
      setFollowingList(prev => prev.map(item => item.following_id === followingId ? data : item));
      console.log(data);
      fetchCounts(profileId);
      setFollowLoading(false);
    }
  }
};

const fetchCounts = async (userId) => {
      const { count: followersCount } = await supabase
        .from("following")
        .select("*", { count: "exact", head: true })
        .eq("following_id", userId);

      const { count: followingCount } = await supabase
        .from("following")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);

      setCounts({
        followers: followersCount || 0,
        following: followingCount || 0,
      });
    };

  return { followingList, followersList, onFollow, followLoading, fetchCounts, counts };
}
