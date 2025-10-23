import mongoose from 'mongoose'

const connectionSchema=new mongoose.Schema({
    from_user_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
          
    },
    to_user_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
          
    },
    status:{
        type:String,
        enum:['Pending','Accepted'],
        default:'Pending'
          
    }
},{timestamps:true})

const Connections=mongoose.model('Connections',connectionSchema)
export default Connections