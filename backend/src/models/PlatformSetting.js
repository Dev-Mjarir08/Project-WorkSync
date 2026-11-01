import mongoose from 'mongoose';

const platformSettingSchema = new mongoose.Schema(
  {
    general: {
      platformName: { type: String, default: 'WorkSync Enterprise Cloud' },
      supportEmail: { type: String, default: 'support@worksync.io' },
      maintenanceMode: { type: Boolean, default: false },
      allowNewRegistrations: { type: Boolean, default: true },
      defaultUserRole: { type: String, default: 'member' },
      sessionTimeoutMinutes: { type: Number, default: 60 }
    },
    security: {
      enforceMfa: { type: Boolean, default: true },
      requireStrongPasswords: { type: Boolean, default: true },
      maxLoginAttempts: { type: Number, default: 5 },
      ipWhitelistEnabled: { type: Boolean, default: false },
      tokenExpiryDays: { type: Number, default: 7 }
    },
    storage: {
      maxAttachmentSizeMb: { type: Number, default: 50 },
      workspaceQuotaGb: { type: Number, default: 20 },
      retentionDays: { type: Number, default: 365 }
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false
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

export const PlatformSetting = mongoose.model('PlatformSetting', platformSettingSchema);
export default PlatformSetting;
