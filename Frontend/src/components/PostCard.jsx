import React, { useState,useEffect } from 'react'
import moment from 'moment'
import { BadgeCheck, Heart, MessageCircle, Share2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useAuth } from '@clerk/clerk-react'
import api from '../api/axios'
import toast from "react-hot-toast";

const PostCard = ({ post }) => {
  // Safety check
  if (!post || !post.user) {
    console.warn('PostCard: Invalid post data', post);
    return null;
  }

  const words = post.content?.split(/(\s+)/) || [];
  const [likes, setLikes] = useState([]);

useEffect(() => {
  setLikes(post.likes_count || []);
}, [post.likes_count]);
  const currentUser = useSelector((state) => state.user.value);
  const { getToken } = useAuth();
  const navigate = useNavigate();

  // Helper function to validate image URL
  const isValidImageUrl = (url) => {
    return url && typeof url === 'string' && url.trim() !== '' && url !== 'undefined' && url !== 'null';
  };

  const handleLike = async () => {
    if (!currentUser?._id) {
      toast.error('Please log in to like posts');
      return;
    }

    // Optimistic update
    const wasLiked = likes.includes(currentUser._id);
    setLikes(prev =>
      wasLiked
        ? prev.filter(id => id !== currentUser._id)
        : [...prev, currentUser._id]
    );

    try {
      const { data } = await api.post(
        '/api/post/like',
        { postId: post._id },
        { headers: { Authorization: `Bearer ${await getToken()}` } }
      );

      if (!data.success) {
        // Revert on failure
        setLikes(prev =>
          wasLiked
            ? [...prev, currentUser._id]
            : prev.filter(id => id !== currentUser._id)
        );
        toast.error(data.message);
      }
    } catch (error) {
      // Revert on error
      setLikes(prev =>
        wasLiked
          ? [...prev, currentUser._id]
          : prev.filter(id => id !== currentUser._id)
      );
      toast.error(error?.response?.data?.message || error.message);
      console.error('Like error:', error);
    }
  };

  const profilePicture = post.user.profile_picture;
  const hasValidProfilePic = isValidImageUrl(profilePicture);
  
  // Filter valid images only
  const validImages = (post.image_urls || []).filter(isValidImageUrl);

  return (
    <div className='bg-white rounded-xl shadow p-4 space-y-4 w-full max-w-2xl'>

      {/* User Info */}
      <div
        onClick={() => post.user?._id && navigate('/profile/' + post.user._id)}
        className='inline-flex items-center gap-3 cursor-pointer'
      >
        {/* Profile Picture or Avatar */}
        {hasValidProfilePic ? (
          <img 
            src={profilePicture} 
            alt={post.user.full_name || 'User'}
            className='w-10 h-10 rounded-full shadow object-cover'
            onError={(e) => {
              console.warn('Failed to load profile picture:', profilePicture);
              e.target.style.display = 'none';
              if (e.target.nextElementSibling) {
                e.target.nextElementSibling.style.display = 'flex';
              }
            }}
          />
        ) : null}
        
        <div 
          className='w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold shadow'
          style={{ display: hasValidProfilePic ? 'none' : 'flex' }}
        >
          {post.user.full_name?.charAt(0).toUpperCase() || post.user.username?.charAt(0).toUpperCase() || '?'}
        </div>
        
        <div>
          <div className='flex items-center space-x-1'>
            <span className='font-medium'>{post.user.full_name || 'Unknown User'}</span>
            {post.user.verified && <BadgeCheck className='w-4 h-4 text-blue-500'/>}
          </div>
          <div className='text-gray-500 text-sm'>
            @{post.user.username || 'unknown'} · {moment(post.createdAt).fromNow()}
          </div>
        </div>
      </div>

      {/* Content */}
      {post.content && (
        <div className="text-gray-800 text-sm whitespace-pre-line">
          {words.map((word, idx) =>
            word.startsWith("#") ? (
              <span key={idx} className="text-indigo-600 font-medium">{word}</span>
            ) : (
              <React.Fragment key={idx}>{word}</React.Fragment>
            )
          )}
        </div>
      )}

      {/* Images - ONLY render if there are valid images */}
      {validImages.length > 0 && (
        <div className={`grid gap-2 ${validImages.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
          {validImages.map((img, index) => (
            <img
              src={img}
              key={index}
              alt={`Post image ${index + 1}`}
              className={`w-full object-cover rounded-lg ${
                validImages.length === 1 ? 'h-auto max-h-96' : 'h-48'
              }`}
              onError={(e) => {
                console.warn('Failed to load image:', img);
                e.target.style.display = 'none';
              }}
            />
          ))}
        </div>
      )}

      {/* Actions */}
      <div className='flex items-center gap-6 text-gray-600 text-sm pt-2 border-t border-gray-200'>
        
        {/* Like */}
        <button
          onClick={handleLike}
          className='flex items-center gap-2 hover:text-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
          disabled={!currentUser?._id}
          aria-label={likes.includes(currentUser?._id) ? 'Unlike post' : 'Like post'}
        >
          <Heart
            className={`w-5 h-5 transition-all ${
              likes.includes(currentUser?._id) ? 'text-red-500 fill-red-500 scale-110' : ''
            }`}
          />
          <span className='font-medium'>{likes.length}</span>
        </button>

        {/* Comment */}
        <button className='flex items-center gap-2 hover:text-blue-500 transition-colors'>
          <MessageCircle className='w-5 h-5'/>
          <span className='font-medium'>12</span>
        </button>

        {/* Share */}
        <button className='flex items-center gap-2 hover:text-green-500 transition-colors'>
          <Share2 className='w-5 h-5'/>
          <span className='font-medium'>7</span>
        </button>

      </div>
    </div>
  );
};

export default PostCard;