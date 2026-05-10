import React, { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { useFollowData } from "./useFollowData";

function FollowSection({ profile }) {
  const { followingList, followersList, loading } = useFollowData(profile.id);
  return (
    <div>
      <div>
        <div>following:</div>
        {followingList.map((user) => (
          <div key={user.following_id}>
            <span>{user.profiles.userName}</span>
          </div>
        ))}
      </div>
      <div>
        <div>followers:</div>
        {followersList.map((user) => (
          <div key={user.following_id}>
            <span>{user.profiles.userName}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FollowSection;
