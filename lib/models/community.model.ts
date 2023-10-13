import mongoose from "mongoose";

const communitySchema = new mongoose.Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
    username: { type: String, unique: true, required: true },
    bio: { type: String },
    image: { type: String },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    threads: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Thread'
        }
    ],
    members: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ]
})

const Community = mongoose.models.Community || mongoose.model('Community', communitySchema);

export default Community;