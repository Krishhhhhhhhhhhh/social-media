import React from 'react'
import {Route, Routes} from 'react-router-dom'
import Login from './pages/login'
import Feed from './pages/feed'
import Messages from './pages/messages'
import Chatbox from './pages/chatbox'
import Connections from './pages/connections'
import Discover from './pages/discover'
import Profile from './pages/profile'
import Createpost from './pages/createpost'
import {useUser} from '@clerk/clerk-react'
import Layout from './pages/layout'
import {Toaster} from 'react-hot-toast'


const App = () => {
  const {user}=useUser()
  return (
    <>
    <Toaster/>

   <Routes>
    <Route path='/' element={!user? <Login/> : <Layout/>}>
    <Route index element={<Feed/>}/>
    <Route path='messages' element={<Messages/>}/>
    <Route path='messages/:userId' element={<Chatbox/>}/>
    <Route path='connections' element={<Connections/>}/>
    <Route path='discover' element={<Discover/>}/>
    <Route path='profile' element={<Profile/>}/>
    <Route path='profile/:profileId' element={<Profile/>}/>
    <Route path='create-post' element={<Createpost/>}/>


    </Route>
    </Routes>
      
    </>
  )
}

export default App
