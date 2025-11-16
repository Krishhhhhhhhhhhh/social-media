import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../api/axios'

const initialState = { 
    connections: [],
    pendingConnections: [],
    followers: [],
    following: [],
    loading: false,
    error: null,
    lastFetched: null
}

export const fetchConnections = createAsyncThunk(
    'connections/fetchConnections',
    async (token, { rejectWithValue }) => { 
        try {
            console.log('🔄 Fetching connections from API...')
            const { data } = await api.get('/api/user/connections', {
                headers: { Authorization: `Bearer ${token}` },
            })
            console.log('✅ Connections API response:', {
                success: data.success,
                connections: data.connections?.length || 0,
                followers: data.followers?.length || 0,
                following: data.following?.length || 0,
                pending: data.pendingConnections?.length || 0
            })
            return data.success ? data : null
        } catch (error) {
            console.error('❌ Fetch connections error:', error)
            return rejectWithValue(error.response?.data || 'Failed to fetch connections')
        }
    }
)

const connectionsSlice = createSlice({
    name: 'connections',
    initialState,
    reducers: {
        clearConnections: (state) => {
            state.connections = []
            state.pendingConnections = []
            state.followers = []
            state.following = []
            console.log('✓ Connections cleared')
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchConnections.pending, (state) => {
                state.loading = true
                state.error = null
                console.log('⏳ Loading connections...')
            })
            .addCase(fetchConnections.fulfilled, (state, action) => {
                state.loading = false
                if (action.payload) {
                    state.connections = action.payload.connections || []
                    state.pendingConnections = action.payload.pendingConnections || []
                    state.followers = action.payload.followers || []
                    state.following = action.payload.following || []
                    state.lastFetched = Date.now()
                    console.log('✅ Connections Redux state updated:', {
                        connections: state.connections.length,
                        followers: state.followers.length,
                        following: state.following.length,
                        pending: state.pendingConnections.length
                    })
                }
            })
            .addCase(fetchConnections.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
                console.error('❌ Failed to update connections state:', action.payload)
            })
    }
})

export const { clearConnections } = connectionsSlice.actions
export default connectionsSlice.reducer