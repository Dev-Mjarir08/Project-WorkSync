import React, { useEffect, useState } from 'react';
import {
  Shield,
  ShieldCheck,
  Users,
  Check,
  Save,
  AlertCircle,
  CheckCircle2,
  Lock,
  RefreshCw,
  Plus,
} from 'lucide-react';
import adminService from '../adminService';

const AVAILABLE_PERMISSIONS = [
  { key: 'view_boards', label: 'View Boards & Tasks', description: 'Can view public and assigned boards and tasks' },
  { key: 'create_tasks', label: 'Create Tasks', description: 'Can create and assign tasks on accessible boards' },
  { key: 'edit_own_tasks', label: 'Edit Own Tasks', description: 'Can update status and details of tasks assigned to self' },
  { key: 'assign_tasks', label: 'Assign & Reassign Tasks', description: 'Can delegate tasks to other team members' },
  { key: 'manage_boards', label: 'Create & Manage Boards', description: 'Can create, configure, and archive Kanban boards' },
  { key: 'manage_projects', label: 'Create & Manage Projects', description: 'Can create and administer project containers' },
  { key: 'manage_members', label: 'Invite & Manage Members', description: 'Can invite new teammates and change workspace roles' },
  { key: 'manage_settings', label: 'Workspace Settings & Billing', description: 'Can update workspace configurations and branding' },
];

const RolesPage = () => {
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const fetchRoles = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getRoles();
      const rolesList = Array.isArray(data) ? data : [];
      setRoles(rolesList);
      if (rolesList.length > 0 && !selectedRole) {
        setSelectedRole(rolesList[0]);
        setSelectedPermissions(rolesList[0].permissions || []);
      }
    } catch (err) {
      console.error('Error fetching roles:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleSelectRole = (role) => {
    setSelectedRole(role);
    setSelectedPermissions(role.permissions || []);
  };

  const handleTogglePermission = (permKey) => {
    if (!selectedRole || selectedRole.slug === 'owner') return;

    setSelectedPermissions((prev) =>
      prev.includes(permKey) ? prev.filter((k) => k !== permKey) : [...prev, permKey]
    );
  };

  const handleSavePermissions = async () => {
    if (!selectedRole) return;
    if (selectedRole.slug === 'owner') {
      setToast({ type: 'error', text: 'Owner permissions are unrestricted and cannot be modified.' });
      setTimeout(() => setToast(null), 4000);
      return;
    }

    setIsSaving(true);
    try {
      await adminService.updateRolePermissions(selectedRole.id, selectedPermissions);
      setRoles((prev) =>
        prev.map((r) =>
          r.id === selectedRole.id ? { ...r, permissions: selectedPermissions } : r
        )
      );
      setToast({ type: 'success', text: `Permissions for ${selectedRole.name} updated successfully!` });
    } catch (err) {
      setToast({ type: 'error', text: err.message || 'Failed to update role permissions.' });
    } finally {
      setIsSaving(false);
      setTimeout(() => setToast(null), 4000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`flex items-center gap-2 p-4 rounded-xl text-sm font-medium border ${
            toast.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="size-4 shrink-0 text-rose-600" />
          )}
          <span>{toast.text}</span>
        </div>
      )}

      {/* Header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-sm font-semibold text-[#6542F5]">Access Governance</p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Roles &amp; Permissions
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Define granular capabilities, customize workspace role permissions, and maintain role-based access control.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchRoles}
          disabled={isLoading}
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
        >
          <RefreshCw className={`size-4 ${isLoading ? 'animate-spin text-[#6542F5]' : 'text-slate-500'}`} />
          Refresh Roles
        </button>
      </header>

      {/* Roles & Permissions Grid */}
      <div className="grid gap-6 lg:grid-cols-[20rem_1fr]">
        {/* Roles List */}
        <section className="rounded-2xl border border-[#E6E7EC] bg-white p-4 shadow-sm shadow-slate-200/25">
          <h2 className="text-base font-semibold text-slate-900 px-2 py-1">Workspace Roles</h2>
          <p className="text-xs text-slate-500 px-2 pb-3">Select a role to inspect or modify capabilities</p>

          <div className="space-y-2">
            {roles.map((role) => {
              const isSelected = selectedRole?.id === role.id;
              const isOwner = role.slug === 'owner';

              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => handleSelectRole(role)}
                  className={`w-full text-left rounded-xl p-3.5 transition flex items-start justify-between border ${
                    isSelected
                      ? 'border-[#6542F5] bg-[#F8F6FF] ring-2 ring-[#6542F5]/10'
                      : 'border-slate-100 hover:bg-slate-50 hover:border-slate-200'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 text-sm">{role.name}</span>
                      {isOwner && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">
                          <Lock className="size-2.5" /> Full
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-slate-500 line-clamp-2">{role.description || 'Standard workspace role'}</p>
                  </div>
                  <span className="text-xs font-semibold text-[#6542F5] bg-white rounded-md px-2 py-0.5 border border-slate-200">
                    {role.permissions?.includes('all') ? 'All' : (role.permissions?.length || 0)}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Permissions Matrix */}
        <section className="rounded-2xl border border-[#E6E7EC] bg-white p-5 shadow-sm shadow-slate-200/25 sm:p-6">
          {selectedRole ? (
            <div className="space-y-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-900">{selectedRole.name} Permissions</h2>
                    {selectedRole.slug === 'owner' ? (
                      <span className="rounded-full bg-purple-100 text-purple-800 px-2.5 py-0.5 text-xs font-medium">
                        System Protected
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-100 text-slate-700 px-2.5 py-0.5 text-xs font-medium">
                        Customizable
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {selectedRole.slug === 'owner'
                      ? 'The workspace owner role has full, unrestricted access to every platform and administrative function.'
                      : 'Toggle permissions to tailor what users with this role can view and execute.'}
                  </p>
                </div>

                {selectedRole.slug !== 'owner' && (
                  <button
                    type="button"
                    onClick={handleSavePermissions}
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#6542F5] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#5635E0] disabled:opacity-50"
                  >
                    <Save className="size-4" />
                    {isSaving ? 'Saving...' : 'Save Permissions'}
                  </button>
                )}
              </div>

              {/* Permissions List */}
              <div className="space-y-3">
                {AVAILABLE_PERMISSIONS.map((perm) => {
                  const isChecked = selectedRole.slug === 'owner'
                    || selectedPermissions.includes('all')
                    || selectedPermissions.includes(perm.key);
                  const isLocked = selectedRole.slug === 'owner';

                  return (
                    <label
                      key={perm.key}
                      className={`flex items-start gap-3.5 p-3.5 rounded-xl border transition ${
                        isChecked
                          ? 'border-[#DCD5FF] bg-[#FAFAFE]'
                          : 'border-slate-100 bg-white hover:bg-slate-50'
                      } ${isLocked ? 'cursor-not-allowed opacity-90' : 'cursor-pointer'}`}
                    >
                      <input
                        type="checkbox"
                        disabled={isLocked}
                        checked={isChecked}
                        onChange={() => handleTogglePermission(perm.key)}
                        className="mt-1 size-4 rounded text-[#6542F5] focus:ring-[#6542F5] border-slate-300 disabled:cursor-not-allowed"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-slate-900">{perm.label}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{perm.description}</div>
                      </div>
                    </label>
                  );
                })}
              </div>

              {selectedRole.slug !== 'owner' && (
                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={handleSavePermissions}
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#6542F5] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#5635E0] disabled:opacity-50"
                  >
                    <Save className="size-4" />
                    {isSaving ? 'Saving Changes...' : 'Save Role Permissions'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="py-20 text-center text-slate-500">
              <Shield className="mx-auto size-8 text-slate-300 mb-2" />
              <p className="text-sm">Select a role from the left to configure permissions.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default RolesPage;
