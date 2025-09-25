import React, { useEffect, useState, useRef } from 'react'
import { dummyMessagesData, dummyUserData } from '../assets/assets/assets'
import { ImageIcon, Send, SendHorizonal } from 'lucide-react'

const Chatbox = () => {
  const [messages, setMessages] = useState(dummyMessagesData)
  const [text, setText] = useState('')
  const [image, setImage] = useState(null)
  const [user, setUser] = useState(dummyUserData)
  const messagesEndRef = useRef(null)

  const sendMessage = async () => {
    // later: add message sending logic here
  }

  // useEffect(() => {
  //   messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  // }, [messages]) 
  useEffect(() => {
  if (messages.length > 0) {
    // Assume first sender is the logged-in user
    const firstSender =
      typeof messages[0].from_user_id === "string"
        ? messages[0].from_user_id
        : messages[0].from_user_id._id

    setUser({ ...dummyUserData, _id: firstSender })
  }
}, [messages])


  return user && (
    <div className='flex flex-col h-screen'>
      {/* Header */}
      <div className='flex items-center gap-2 p-2 md:px-10 xl:pl-40
        bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-300'>
        <img src={user.profile_picture} className='size-8 rounded-full' alt="" />
        <div>
          <p className='font-medium'>{user.full_name}</p>
          <p className='text-sm text-gray-500 mt-1.5'>@{user.username}</p>
        </div>
      </div>

      {/* Messages */}
      <div className='p-5 md:px-10 h-full overflow-y-scroll'>
        <div className='space-y-4 max-w-4xl mx-auto'>
          {messages
            .slice()
            .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
            .map((message, index) => {
              const isOwnMessage =
  (typeof message.from_user_id === "string"
    ? message.from_user_id === user._id
    : message.from_user_id._id === user._id)
    //Log
    console.log("Message:", message.from_user_id, "User:", user._id, "isOwn:", isOwnMessage)


              return (
                <div
                  key={message._id || index}
                  className={`flex flex-col ${isOwnMessage ? 'items-start' : 'items-end'}`}
                >
                  <div
                    className={`p-2 text-sm max-w-sm rounded-lg shadow
                    ${isOwnMessage
                      ? 'bg-indigo-500 text-white rounded-br-none'
                      : 'bg-white text-slate-700 rounded-bl-none'
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

      <div className='px-4'>
        <div className='flex items-center gap-3 pl-5 p-1.5 bg-white w-full
        max-w-xl mx-auto border border-gray-200 shadow  rounded-full mb-5'>
          <input type="text"  className='flex-1 outline-none text-slate-700'
          placeholder='Type a message ....' 
          onKeyDown={e=>e.key === 'Enter' && sendMessage()} onChange={(e)=>
            setText(e.target.value)} value={text}/>
            <label htmlFor="image">
              {
                image? <img src={URL.createObjectURL(image)} className='h-8 rounded' />:<ImageIcon className='size-7 
                text-gray-400 cursor-pointer'/>
              }
              <input type="file" id='image' accept='image/*' hidden 
              onChange={(e)=>setImage(e.target.files[0])}/>
            </label>
            <button className='bg-gradient-to-br from-indigo-500 to-purple-600 
hover:from-indigo-700 hover:to-purple-800 active:scale-95 
cursor-pointer text-white p-2 rounded-full'>
              <SendHorizonal size={18}/>
            </button>

        </div>

      </div>
    </div>
  )
}

export default Chatbox
