import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Role name is required'],
      trim: true,
      maxlength: [50, 'Role name cannot exceed 50 characters']
    },
    slug: {
      type: String,
      required: [true, 'Role slug is required'],
      lowercase: true,
      trim: true
    },
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: false,
      index: true
    },
    description: {
      type: String,
      default: '',
      maxlength: [200, 'Description cannot exceed 200 characters']
    },
    isSystemRole: {
      type: Boolean,
      default: false
    },
    permissions: [
      {
        type: String,
        trim: true
      }
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false
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

// Compound index to ensure uniqueness per workspace (or globally if workspace is null)
roleSchema.index({ slug: 1, workspace: 1 }, { unique: true });

export const Role = mongoose.model('Role', roleSchema);
export default Role;
