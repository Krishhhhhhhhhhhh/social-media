import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../api/axios'     // ✅ Import your axios instance
import { toast } from 'react-hot-toast' // ✅ Import toast

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
  reducers: {},
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

export default userSlice.reducer
