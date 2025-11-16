import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../api/axios'
import { toast } from 'react-hot-toast'

const initialState = {
  value: null,
  loading: false,
  error: null,
}

export const fetchUser = createAsyncThunk(
  'user/fetchUser',
  async (token, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/api/user/data', {
        headers: { Authorization: `Bearer ${token}` },
      })
      return data.success ? data.user : null
    } catch (error) {
      console.error('Fetch user failed:', error)
      return rejectWithValue(error.response?.data || 'Failed to fetch user')
    }
  }
)

export const updateUser = createAsyncThunk(
  'user/update',
  async ({ userData, token }, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/api/user/update', userData, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (data.success) {
        toast.success(data.message)
        return data.user
      } else {
        toast.error(data.message)
        return null
      }
    } catch (error) {
      toast.error('Update failed')
      console.error('Update user failed:', error)
      return rejectWithValue(error.response?.data || 'Failed to update user')
    }
  }
)

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // ✅ Manual reducers to update followers/following immediately
    updateUserFollowers: (state, action) => {
      if (state.value) {
        const { followers, following } = action.payload
        if (followers) state.value.followers = followers
        if (following) state.value.following = following
      }
    },
    addFollower: (state, action) => {
      if (state.value && !state.value.followers.includes(action.payload)) {
        state.value.followers.push(action.payload)
      }
    },
    removeFollower: (state, action) => {
      if (state.value) {
        state.value.followers = state.value.followers.filter(
          id => id.toString() !== action.payload.toString()
        )
      }
    },
    addFollowing: (state, action) => {
      if (state.value && !state.value.following.includes(action.payload)) {
        state.value.following.push(action.payload)
        console.log('✓ Added to following in Redux:', action.payload)
      }
    },
    removeFollowing: (state, action) => {
      if (state.value) {
        state.value.following = state.value.following.filter(
          id => id.toString() !== action.payload.toString()
        )
        console.log('✓ Removed from following in Redux:', action.payload)
      }
    },
    addConnection: (state, action) => {
      if (state.value && !state.value.connections.includes(action.payload)) {
        state.value.connections.push(action.payload)
        console.log('✓ Added to connections in Redux:', action.payload)
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.loading = false
        state.value = action.payload
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.value = action.payload
      })
  },
})

export const { 
  updateUserFollowers, 
  addFollower, 
  removeFollower, 
  addFollowing, 
  removeFollowing,
  addConnection 
} = userSlice.actions

export default userSlice.reducer