import mongoose from 'mongoose'

const connectionSchema = new mongoose.Schema({
    from_user_id: {
        type: String,  // ✅ Changed from ObjectId to String (for Clerk IDs)
        ref: 'User',
        required: true
    },
    to_user_id: {
        type: String,  // ✅ Changed from ObjectId to String (for Clerk IDs)
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Accepted'],
        default: 'Pending'
    }
}, { timestamps: true })

const Connections = mongoose.model('Connections', connectionSchema)
export default Connections