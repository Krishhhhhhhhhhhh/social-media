import React, { useEffect, useState } from 'react'
import { Users, UserPlus, UserCheck, UserRoundPen, MessageSquare, RefreshCw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useAuth } from '@clerk/clerk-react'
import { fetchConnections } from '../features/connections/connectionsSlice'
import { addFollowing, removeFollowing, addConnection, fetchUser } from '../features/user/userSlice'
import api from '../api/axios'
import { toast } from 'react-hot-toast'

const Connections = () => {
  const navigate = useNavigate()
  const { getToken } = useAuth()
  const dispatch = useDispatch()

  const [currentTab, setCurrentTab] = useState('Followers')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { connections, pendingConnections, followers, following } = useSelector((state) => state.connections)
  
  const dataArray = [
    { label: 'Followers', value: followers, icon: Users },
    { label: 'Following', value: following, icon: UserCheck },
    { label: 'Pending', value: pendingConnections, icon: UserRoundPen },
    { label: 'Connections', value: connections, icon: UserPlus }
  ]

  // Manual refresh function
  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      const token = await getToken()
      console.log('🔄 Manual refresh initiated...')
      await dispatch(fetchConnections(token))
      await dispatch(fetchUser(token))
      toast.success('Data refreshed!')
      console.log('✅ Manual refresh completed')
    } catch (error) {
      toast.error('Failed to refresh')
      console.error('❌ Refresh error:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  // Function to FOLLOW a user (for Followers tab - Follow Back)
  const handleFollowBack = async (userId) => {
    try {
      const token = await getToken()
      console.log('🔄 Sending follow request to:', userId)
      
      const { data } = await api.post('/api/user/follow', 
        { id: userId },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
      console.log('✅ Follow response:', data)
      
      if (data.success) {
        toast.success(data.message || 'Successfully followed user')
        
        // ✅ Update user slice immediately (for profile page)
        dispatch(addFollowing(userId))
        
        // ✅ Refresh connections data (for this page)
        await dispatch(fetchConnections(token))
        
        // ✅ Fully refresh user data
        await dispatch(fetchUser(token))
        
        console.log('✅ All data refreshed after follow')
      } else {
        toast.error(data.message || 'Failed to follow user')
      }
    } catch (error) {
      console.error('❌ Follow error:', error)
      toast.error(error?.response?.data?.message || 'Failed to follow user')
    }
  }

  // Function to UNFOLLOW a user
  const handleUnfollow = async (userId) => {
    try {
      const token = await getToken()
      console.log('🔄 Sending unfollow request to:', userId)
      
      const { data } = await api.post('/api/user/unfollow', 
        { id: userId },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
      console.log('✅ Unfollow response:', data)
      
      if (data.success) {
        toast.success(data.message || 'Successfully unfollowed')
        
        // ✅ Update user slice immediately (for profile page)
        dispatch(removeFollowing(userId))
        
        // ✅ Refresh connections data (for this page)
        await dispatch(fetchConnections(token))
        
        // ✅ Fully refresh user data
        await dispatch(fetchUser(token))
        
        console.log('✅ All data refreshed after unfollow')
      } else {
        toast.error(data.message || 'Failed to unfollow')
      }
    } catch (error) {
      console.error('❌ Unfollow error:', error)
      toast.error(error?.response?.data?.message || 'Failed to unfollow')
    }
  }

  // Function to ACCEPT connection request
  const acceptConnection = async (userId) => {
    try {
      const token = await getToken()
      console.log('🔄 Accepting connection from:', userId)
      
      const { data } = await api.post('/api/user/accept', 
        { id: userId },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
      console.log('✅ Accept response:', data)
      
      if (data.success) {
        toast.success(data.message || 'Connection accepted')
        
        // ✅ Update user slice immediately (for profile page)
        dispatch(addConnection(userId))
        
        // ✅ Refresh connections data (for this page)
        await dispatch(fetchConnections(token))
        
        // ✅ Fully refresh user data
        await dispatch(fetchUser(token))
        
        console.log('✅ All data refreshed after accept')
      } else {
        toast.error(data.message || 'Failed to accept connection')
      }
    } catch (error) {
      console.error('❌ Accept connection error:', error)
      toast.error(error?.response?.data?.message || 'Failed to accept connection')
    }
  }

  useEffect(() => {
    // Always fetch fresh data when component mounts
    const fetchData = async () => {
      try {
        const token = await getToken()
        console.log('🔄 Component mounted - Fetching connections data...')
        await dispatch(fetchConnections(token))
        console.log('✅ Initial data fetch complete')
      } catch (error) {
        console.error('❌ Initial fetch error:', error)
      }
    }
    
    fetchData()
  }, [dispatch, getToken])
  
  // Refresh when tab comes back into focus
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        getToken().then(async (token) => {
          console.log('👀 Tab visible - refreshing connections...')
          await dispatch(fetchConnections(token))
        })
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [dispatch, getToken])

  return (
    <div className='min-h-screen bg-slate-50'>
      <div className='max-w-6xl mx-auto p-6'>
        {/* Title */}
        <div className='mb-8 flex justify-between items-center'>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Connections</h1>
            <p className="text-slate-600">Manage your network and discover new connections</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white transition ${isRefreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Counts */}
        <div className='mb-8 flex flex-wrap gap-6'>
          {dataArray.map((item, index) => (
            <div key={index} className='flex flex-col items-center justify-center gap-1 border h-20 w-40 border-gray-200 bg-white shadow rounded-md'>
              <b>{item.value.length}</b>
              <p className='text-slate-600'>{item.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className='cursor-pointer inline-flex flex-wrap items-center border border-gray-200 rounded-md p-1 bg-white shadow-sm'>
          {dataArray.map((tab) => (
            <button 
              onClick={() => setCurrentTab(tab.label)} 
              key={tab.label} 
              className={`cursor-pointer flex items-center px-3 py-1 text-sm rounded-md transition-colors
                ${currentTab === tab.label ? 'bg-slate-100 font-medium text-black' : 'text-gray-500 hover:text-black'}`}
            >
              <tab.icon className='w-4 h-4' />
              <span className='ml-1'>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Connections List */}
        <div className='flex flex-wrap gap-6 mt-6'>
          {dataArray.find(item => item.label === currentTab)?.value?.length > 0 ? (
            dataArray.find(item => item.label === currentTab).value.map(user => (
              <div key={user._id} className='w-full max-w-88 flex gap-5 p-6 bg-white shadow rounded-md'>
               <img 
  src={user.profile_picture || 'https://via.placeholder.com/150'} 
  className='rounded-full w-12 h-12 shadow-md mx-auto' 
  alt={user.full_name} 
  onError={(e) => e.target.src = 'https://via.placeholder.com/150'}
/>
                <div className='flex-1'>
                  <p className='font-medium text-slate-700'>{user.full_name}</p>
                  <p className='text-slate-500'>@{user.username}</p>
                  <p className='text-sm text-slate-600'>{user.bio?.slice(0, 30)}...</p>
                  
                  <div className='flex max-sm:flex-col gap-2 mt-4'>
                    <button 
                      onClick={() => navigate(`/profile/${user._id}`)}
                      className='w-full p-2 text-sm rounded bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-95 transition text-white cursor-pointer'
                    >
                      View Profile
                    </button>

                    {currentTab === 'Followers' && (
                      <button 
                        onClick={() => handleFollowBack(user._id)}
                        className='w-full p-2 text-sm rounded bg-slate-100 hover:bg-slate-200 text-black active:scale-95 transition cursor-pointer'
                      >
                        Follow Back
                      </button>
                    )}

                    {currentTab === 'Following' && (
                      <button 
                        onClick={() => handleUnfollow(user._id)}
                        className='w-full p-2 text-sm rounded bg-slate-100 hover:bg-slate-200 text-black active:scale-95 transition cursor-pointer'
                      >
                        Unfollow
                      </button>
                    )}

                    {currentTab === 'Pending' && (
                      <button 
                        onClick={() => acceptConnection(user._id)} 
                        className='w-full p-2 text-sm rounded bg-slate-100 hover:bg-slate-200 text-black active:scale-95 transition cursor-pointer'
                      >
                        Accept
                      </button>
                    )}

                    {currentTab === 'Connections' && (
                      <button 
                        onClick={() => navigate(`/messages/${user._id}`)} 
                        className='w-full p-2 text-sm rounded bg-slate-100 hover:bg-slate-200 text-black active:scale-95 transition cursor-pointer flex items-center justify-center gap-1'
                      >
                        <MessageSquare className='w-4 h-4' />
                        Message
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className='w-full text-center py-12 text-slate-500'>
              No {currentTab.toLowerCase()} yet
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Connections