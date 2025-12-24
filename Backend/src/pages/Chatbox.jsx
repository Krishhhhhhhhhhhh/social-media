import React, { useEffect, useState, useRef } from 'react'
import { ImageIcon, SendHorizonal } from 'lucide-react'
import { useParams } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '@clerk/clerk-react'
import toast from 'react-hot-toast'

const Chatbox = () => {
  const { userId } = useParams()
  const { getToken } = useAuth()

  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [image, setImage] = useState(null)
  const [user, setUser] = useState(null)

  const messagesEndRef = useRef(null)

  // 🔹 Fetch chat user (HEADER DATA)
  const fetchChatUser = async () => {
    try {
      const token = await getToken()
      const { data } = await api.get(`/api/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!data.success) {
        toast.error(data.message)
        return
      }

      setUser(data.user)
    } catch (error) {
      toast.error(error.message)
    }
  }

  // 🔹 Fetch messages
  const fetchMessages = async () => {
    try {
      const token = await getToken()
      const { data } = await api.get(`/api/messages/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (data.success) {
        setMessages(data.messages)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    fetchChatUser()
    fetchMessages()
  }, [userId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!text && !image) return

    try {
      const token = await getToken()
      const formData = new FormData()
      formData.append('text', text)
      if (image) formData.append('image', image)

      const { data } = await api.post(
        `/api/messages/${userId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      if (data.success) {
        setMessages(prev => [...prev, data.message])
        setText('')
        setImage(null)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  if (!user) return null

  return (
    <div className='flex flex-col h-screen'>
      {/* Header */}
      <div className='flex items-center gap-2 p-2 md:px-10 xl:pl-40
        bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-300'>
        <img
          src={user.profile_picture}
          className='size-8 rounded-full'
          alt=""
        />
        <div>
          <p className='font-medium'>{user.full_name}</p>
          <p className='text-sm text-gray-500 mt-1.5'>@{user.username}</p>
        </div>
      </div>

      {/* Messages */}
      <div className='p-5 md:px-10 h-full overflow-y-scroll'>
        <div className='space-y-4 max-w-4xl mx-auto'>
          {messages.map((message, index) => {
            const isOwnMessage = message.from_user_id === userId

            return (
              <div
                key={message._id || index}
                className={`flex flex-col ${
                  isOwnMessage ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`p-2 text-sm max-w-sm rounded-lg shadow
                  ${
                    isOwnMessage
                      ? 'bg-indigo-500 text-white rounded-bl-none'
                      : 'bg-white text-slate-700 rounded-br-none'
                  }`}
                >
                  {message.message_type === 'image' && (
                    <img
                      src={message.media_url}
                      className='w-full max-w-sm rounded-lg mb-1'
                      alt=""
                    />
                  )}
                  <p>{message.text}</p>
                </div>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className='px-4'>
        <div className='flex items-center gap-3 pl-5 p-1.5 bg-white w-full
        max-w-xl mx-auto border border-gray-200 shadow rounded-full mb-5'>
          <input
            type="text"
            className='flex-1 outline-none text-slate-700'
            placeholder='Type a message...'
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            onChange={e => setText(e.target.value)}
            value={text}
          />

          <label htmlFor="image">
            {image ? (
              <img
                src={URL.createObjectURL(image)}
                className='h-8 rounded'
              />
            ) : (
              <ImageIcon className='size-7 text-gray-400 cursor-pointer' />
            )}
            <input
              type="file"
              id='image'
              accept='image/*'
              hidden
              onChange={e => setImage(e.target.files[0])}
            />
          </label>

          <button
            onClick={sendMessage}
            className='bg-gradient-to-br from-indigo-500 to-purple-600
            hover:from-indigo-700 hover:to-purple-800 active:scale-95
            cursor-pointer text-white p-2 rounded-full'
          >
            <SendHorizonal size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default Chatbox
