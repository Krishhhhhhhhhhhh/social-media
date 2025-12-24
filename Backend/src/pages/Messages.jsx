import React, { useMemo } from 'react';
import { Eye, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Messages = () => {
  const navigate = useNavigate();

  // Get real users from Redux store
  const { connections, following } = useSelector(
    (state) => state.connections
  );

  // Merge connections + following (remove duplicates)
  const messageableUsers = useMemo(() => {
    const map = new Map();

    (connections || []).forEach((user) => {
      map.set(user._id, user);
    });

    (following || []).forEach((user) => {
      if (!map.has(user._id)) {
        map.set(user._id, user);
      }
    });

    return Array.from(map.values());
  }, [connections, following]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto p-6">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Messages</h1>
          <p className="text-slate-600">Chat with your friends and family</p>
        </div>

        {/* User List */}
        <div className="flex flex-col gap-3">
          {messageableUsers.length > 0 ? (
            messageableUsers.map((user) => (
              <div
                key={user._id}
                className="max-w-xl flex items-center gap-5 p-6 bg-white shadow rounded-md"
              >
                <img
                  src={user.profile_picture}
                  className="w-12 h-12 rounded-full object-cover"
                  alt="profile"
                />

                <div className="flex-1">
                  <p className="font-semibold text-slate-700">
                    {user.full_name}
                  </p>
                  <p className="text-slate-500">@{user.username}</p>
                  <p className="text-slate-600">{user.bio}</p>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => navigate(`/messages/${user._id}`)}
                    className="size-10 flex items-center justify-center rounded 
                               bg-slate-100 hover:bg-slate-200 transition"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => navigate(`/profile/${user._id}`)}
                    className="size-10 flex items-center justify-center rounded 
                               bg-slate-100 hover:bg-slate-200 transition"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 bg-white shadow rounded-md">
              <p className="text-slate-600">
                No users available to message yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
