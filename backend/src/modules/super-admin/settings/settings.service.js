import { PlatformSetting } from '../../../models/PlatformSetting.js';
import { AuditLog } from '../../../models/AuditLog.js';

const recordAudit = async ({ action, category = 'system', details, actor, target = 'Platform Settings', targetId = '', status = 'success' }) => {
  try {
    await AuditLog.create({
      action,
      category,
      details,
      actor: {
        user: actor?._id || actor?.id,
        name: actor?.name || 'Super Admin',
        email: actor?.email || 'admin@worksync.io'
      },
      target,
      targetId: targetId ? targetId.toString() : '',
      status
    });
  } catch (err) {
    console.error('AuditLog error:', err.message);
  }
};

export const getPlatformSettingsDoc = async () => {
  let settings = await PlatformSetting.findOne();
  if (!settings) {
    settings = await PlatformSetting.create({
      general: {
        platformName: 'WorkSync Enterprise Cloud',
        supportEmail: 'support@worksync.io',
        maintenanceMode: false,
        allowNewRegistrations: true,
        defaultUserRole: 'member',
        sessionTimeoutMinutes: 60
      },
      security: {
        enforceMfa: false,
        requireStrongPasswords: true,
        maxLoginAttempts: 5,
        ipWhitelistEnabled: false,
        tokenExpiryDays: 7
      },
      registration: {
        allowNewRegistrations: true,
        defaultUserRole: 'member',
        requireEmailVerification: false,
        allowedEmailDomains: []
      },
      notifications: {
        emailAlerts: true,
        securityAlerts: true,
        digestFrequency: 'daily',
        slackWebhookUrl: ''
      }
    });
  }
  return settings;
};

export const getAllSettings = async () => {
  const settings = await getPlatformSettingsDoc();
  return {
    general: settings.general,
    security: settings.security,
    registration: settings.registration,
    notifications: settings.notifications,
    storage: settings.storage,
    updatedAt: settings.updatedAt
  };
};

export const updateGeneralSettings = async (generalData, actorAdmin) => {
  const settings = await getPlatformSettingsDoc();
  settings.general = { ...settings.general.toObject(), ...generalData };
  settings.updatedBy = actorAdmin?._id;
  await settings.save();

  await recordAudit({
    action: 'General Settings Updated',
    details: `Updated platform general settings`,
    actor: actorAdmin,
    targetId: settings._id.toString()
  });

  return settings.general;
};

export const updateSecuritySettings = async (securityData, actorAdmin) => {
  const settings = await getPlatformSettingsDoc();
  settings.security = { ...settings.security.toObject(), ...securityData };
  settings.updatedBy = actorAdmin?._id;
  await settings.save();

  await recordAudit({
    action: 'Security Policies Updated',
    category: 'security',
    details: `Modified platform security configurations and MFA policies`,
    actor: actorAdmin,
    targetId: settings._id.toString()
  });

  return settings.security;
};

export const updateRegistrationSettings = async (registrationData, actorAdmin) => {
  const settings = await getPlatformSettingsDoc();
  settings.registration = { ...settings.registration.toObject(), ...registrationData };
  settings.updatedBy = actorAdmin?._id;
  await settings.save();

  await recordAudit({
    action: 'Registration Settings Updated',
    details: `Updated new user registration configuration`,
    actor: actorAdmin,
    targetId: settings._id.toString()
  });

  return settings.registration;
};

export const updateNotificationSettings = async (notificationData, actorAdmin) => {
  const settings = await getPlatformSettingsDoc();
  settings.notifications = { ...settings.notifications.toObject(), ...notificationData };
  settings.updatedBy = actorAdmin?._id;
  await settings.save();

  await recordAudit({
    action: 'Notification Settings Updated',
    details: `Updated system notification rules and alerts`,
    actor: actorAdmin,
    targetId: settings._id.toString()
  });

  return settings.notifications;
};

export const getSecurityConfiguration = async () => {
  const settings = await getPlatformSettingsDoc();
  return {
    security: settings.security,
    updatedAt: settings.updatedAt
  };
};

