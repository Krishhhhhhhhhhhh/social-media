import React, { useEffect, useRef } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Login from './pages/Login'
import Feed from './pages/Feed'
import Messages from './pages/Messages'
import Chatbox from './pages/Chatbox'
import Connections from './pages/Connections'
import Discover from './pages/Discover'
import Profile from './pages/Profile'
import Createpost from './pages/Createpost'
import Layout from './pages/Layout'
import { useUser, useAuth } from '@clerk/clerk-react'
import { Toaster } from 'react-hot-toast'
import { useDispatch, useSelector } from 'react-redux'
import { fetchUser } from './features/user/userSlice'
import { fetchConnections } from './features/connections/connectionsSlice'
import { addMessage } from './features/messages/messagesSlice'

const App = () => {
  const { user } = useUser()
  const { getToken } = useAuth()
  const {pathname}=useLocation()
  const pathnameRef=useRef(pathname)
  const dispatch = useDispatch()
  const { loading, error } = useSelector((state) => state.user)

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        try {
          const token = await getToken()
          await dispatch(fetchUser(token)).unwrap()
          await dispatch(fetchConnections(token)).unwrap()

        } catch (err) {
          console.error('Failed to fetch user data:', err)
        }
      }
    }
    fetchData()
  }, [user, getToken, dispatch])

  useEffect(()=>{
    pathnameRef.current=pathname
  },[pathname])

  useEffect(()=>{
    if(user){
      const eventSource=new EventSource(import.meta.env.VITE_BASEURL + '/api/message/' +user.id);
      eventSource.onmessage=(event)=>{
        try {
          const message=JSON.parse(event.data)
          // Check if current page is the messages page for this sender
          const currentChatPath = `/messages/${message.from_user_id._id || message.from_user_id}`
          if(pathnameRef.current === currentChatPath){
            dispatch(addMessage(message))
            console.log('✓ Message received and added:', message._id)
          }
          else
          {
            console.log('ℹ Message received but not on this chat page:', currentChatPath)
          }
        } catch (err) {
          console.error('Error parsing SSE message:', err)
        }
      }
      eventSource.onerror = (error) => {
        console.error('SSE connection error:', error)
        eventSource.close()
      }
      return ()=>{
        eventSource.close()
      }
    }
  },[user,dispatch])

  return (
    <>
      <Toaster />

      <Routes>
        <Route path='/' element={!user ? <Login /> : <Layout />}>
          <Route index element={<Feed />} />
          <Route path='messages' element={<Messages />} />
          <Route path='messages/:userId' element={<Chatbox />} />
          <Route path='connections' element={<Connections />} />
          <Route path='discover' element={<Discover />} />
          <Route path='profile' element={<Profile />} />
          <Route path='profile/:profileId' element={<Profile />} />
          <Route path='create-post' element={<Createpost />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
