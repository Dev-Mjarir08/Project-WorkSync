import mongoose from 'mongoose';

const permissionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Permission name is required'],
      trim: true
    },
    key: {
      type: String,
      required: [true, 'Permission key is required'],
      unique: true,
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    category: {
      type: String,
      enum: ['User Management', 'Workspace Management', 'Board Management', 'Communications', 'Security', 'System', 'Other'],
      default: 'Other'
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

export const Permission = mongoose.model('Permission', permissionSchema);
export default Permission;

