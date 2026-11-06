import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    token: {
      type: String,
      default: ''
    },
    ip: {
      type: String,
      default: '127.0.0.1'
    },
    userAgent: {
      type: String,
      default: 'Desktop'
    },
    device: {
      type: String,
      default: 'Desktop'
    },
    isValid: {
      type: Boolean,
      default: true
    },
    lastActive: {
      type: Date,
      default: Date.now
    },
    expiresAt: {
      type: Date
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret.__v;
        return ret;
      }
    }
  }
);

sessionSchema.index({ user: 1, isValid: 1 });

export const Session = mongoose.model('Session', sessionSchema);
export default Session;

