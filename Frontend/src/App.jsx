import React, { useEffect } from 'react'
import { Route, Routes } from 'react-router-dom'
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

const App = () => {
  const { user } = useUser()
  const { getToken } = useAuth()
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
