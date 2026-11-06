import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: [true, 'Action is required'],
      trim: true
    },
    category: {
      type: String,
      enum: ['user_management', 'workspace', 'security', 'authentication', 'system', 'other'],
      default: 'system'
    },
    details: {
      type: String,
      required: [true, 'Details are required'],
      trim: true
    },
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      index: true
    },
    actor: {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
      name: { type: String, default: 'System Sentinel' },
      email: { type: String, default: 'system@worksync.internal' },
      avatar: { type: String, default: '' }
    },
    target: {
      type: String,
      default: ''
    },
    targetId: {
      type: String,
      default: ''
    },
    ip: {
      type: String,
      default: '127.0.0.1'
    },
    location: {
      type: String,
      default: 'Local'
    },
    status: {
      type: String,
      enum: ['success', 'warning', 'error', 'info'],
      default: 'success'
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
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

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;
