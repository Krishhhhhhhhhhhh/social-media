import React from 'react'
import {  dummyUsers } from '../assets/assets/assets'
import { Eye, MessageSquare } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

// Show users that can be messaged: both mutual connections and users you follow

const Messages = () => {
  const { connections, following } = useSelector((state) => state.connections)
  const navigate=useNavigate()
  // Merge connections + following (unique by _id)
  const messageableUsers = React.useMemo(() => {
    const map = new Map()
    ;(connections || []).forEach((u) => map.set(u._id, u))
    ;(following || []).forEach((u) => {
      if (!map.has(u._id)) map.set(u._id, u)
    })
    return Array.from(map.values())
  }, [connections, following])
  return (
    <div className="min-h-screen relative bg-slate-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Messages</h1>
          <p className="text-slate-600">Chat with your friends and family</p>
        </div>

        {/* Messageable Users (connections + following) */}
        <div className="flex flex-col gap-3">
          {messageableUsers.length > 0 ? messageableUsers.map((user) => (
            <div
              key={user._id}
              className="max-w-xl flex items-center gap-5 p-6 bg-white shadow rounded-md"
            >
              <img
                src={user.profile_picture}
                className="w-12 h-12 rounded-full object-cover aspect-square "
                alt=""
              />
              <div className='flex-1'>
                <p className="font-semibold text-slate-700">{user.full_name}</p>
                <p className="text-slate-500">@{user.username}</p>
                <p className="text-slate-600">{user.bio}</p>
              </div>
                <div className='flex flex-col gap-2 mt-4'>
                
                <button onClick={()=>navigate(`/messages/${user._id}`)} className='size-10 flex items-center justify-center text-sm rounded 
             bg-slate-100 hover:bg-slate-200 text-slate-800 
             active:scale-95 transition cursor-pointer gap-1'>
                  <MessageSquare className='w-4 h-4'/>
                </button>

                <button onClick={()=>navigate(`/profile/${user._id}`)} className='size-10 flex items-center justify-center text-sm rounded 
             bg-slate-100 hover:bg-slate-200 text-slate-800 
             active:scale-95 transition cursor-pointer '>
                  <Eye className='w-4 h-4'/>
                </button>

              </div>

            </div>
          )) : (
            <div className='p-6 bg-white shadow rounded-md'>
              <p className='text-slate-600'>No profiles available to message yet.</p>
              <p className='text-sm text-slate-500'>Follow users or accept connections to start messaging.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Messages
