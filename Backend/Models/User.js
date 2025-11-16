import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    _id: {
        type: String,  // Keep as String since you're using Clerk IDs
        required: true
    },
    email: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
    },
    full_name: {  
        type: String,
        default: ''
    },
    bio: {
        type: String,
        default: "Hey there! I am using Social Media App."
    },
    profile_picture: {
        type: String, 
        default: '',
    },
    cover_photo: {
        type: String,
        default: '',
    },
    location: {
        type: String,
        default: '',
    },
    // ✅ FIXED: Changed from String to mongoose.Schema.Types.ObjectId
    // BUT since your _id is String (Clerk IDs), these should also be String
    // However, they need to match the _id type for populate to work
    followers: [{
        type: String,  // Matches _id type (Clerk string IDs)
        ref: 'User'
    }],
    following: [{
        type: String,  // Matches _id type (Clerk string IDs)
        ref: 'User'
    }],
    connections: [{
        type: String,  // Matches _id type (Clerk string IDs)
        ref: 'User'
    }],
}, { timestamps: true, minimize: false });

export const User = mongoose.model('User', userSchema);