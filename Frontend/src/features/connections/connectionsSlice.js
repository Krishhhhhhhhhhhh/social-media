import  {createSlice} from '@reduxjs/toolkit'


const initialState={ 
    coonections:[],
    pendingConnections:[],
    followers:[],
    following:[]
}
const connectionsSlice=createSlice({
    name:'connections',
    initialState,
    reducers:{

    }
})
export default connectionsSlice.reducer