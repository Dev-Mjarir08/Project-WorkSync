import mongoose from 'mongoose';

const workspaceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Workspace name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      lowercase: true,
      trim: true
    },
    description: {
      type: String,
      default: '',
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false
    },
    ownerDetails: {
      name: { type: String, default: '' },
      email: { type: String, default: '' }
    },
    members: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        role: {
          type: String,
          enum: ['owner', 'admin', 'manager', 'member', 'viewer'],
          default: 'member'
        },
        joinedAt: { type: Date, default: Date.now }
      }
    ],
    membersCount: {
      type: Number,
      default: 1
    },
    boardsCount: {
      type: Number,
      default: 0
    },
    tasksCount: {
      type: Number,
      default: 0
    },
    plan: {
      type: String,
      enum: ['Starter', 'Pro', 'Enterprise'],
      default: 'Pro'
    },
    status: {
      type: String,
      enum: ['Active', 'Archived', 'Suspended'],
      default: 'Active'
    },
    isActive: {
      type: Boolean,
      default: true
    },
    storageUsed: {
      type: String,
      default: '50 MB'
    },
    settings: {
      general: {
        defaultRole: { type: String, default: 'member' },
        allowMemberInvites: { type: Boolean, default: true },
        timezone: { type: String, default: 'UTC' }
      },
      privacy: {
        isPublic: { type: Boolean, default: false },
        inviteOnly: { type: Boolean, default: true }
      },
      notifications: {
        emailNotifications: { type: Boolean, default: true },
        taskAlerts: { type: Boolean, default: true },
        weeklyDigest: { type: Boolean, default: true }
      },
      permissions: {
        memberCanCreateBoards: { type: Boolean, default: true },
        memberCanCreateProjects: { type: Boolean, default: true },
        memberCanInvite: { type: Boolean, default: false }
      }
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        ret.id = ret._id.toString();
        delete ret.__v;
        return ret;
      }
    }
  }
);

export const Workspace = mongoose.model('Workspace', workspaceSchema);
export default Workspace;
