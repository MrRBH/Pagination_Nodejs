import mongoose from 'mongoose';
// mongoose.set('debug', true); // Put this early in your app


const SessionSchema  = mongoose.Schema({
    accessToken: {
        type: String,
        required: true,
    },
    refreshToken: {
        type: String,
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    userAgent: {
        type: String,
        required: true,
    }, 
    ipAddress: {
        type: String,
        required: true,
    },

},{ timestamps: true })
const Session = mongoose.model("Session", SessionSchema);
export default Session;