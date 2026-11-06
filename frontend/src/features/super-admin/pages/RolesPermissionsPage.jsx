import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Shield,
  Users,
  Check,
  X,
  Lock,
  ArrowRight,
  Info,
  Sparkles,
  Layers,
  HelpCircle
} from 'lucide-react';
import superAdminService from '../superAdminService.js';

export const RolesPermissionsPage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState('super_admin');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await superAdminService.getRolesPermissions();
        setData(res);
      } catch (err) {
        console.error('Failed to load roles and permissions:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-slate-400">Loading RBAC permissions matrix...</p>
      </div>
    );
  }

  const { roles, categories } = data || {};

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-800/60">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <ShieldCheck className="h-7 w-7 text-indigo-400" />
              <span>Roles & Permission Matrix</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              RBAC v2.4
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Global security policies, access hierarchy, and platform privilege boundaries across WorkSync tenants.
          </p>
        </div>

        <button
          onClick={() => navigate('/super-admin/users')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/20 transition-all self-start sm:self-auto"
        >
          <Users className="h-4 w-4" />
          <span>Assign Roles to Users</span>
        </button>
      </div>

      {/* Role Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {roles?.map(role => {
          const isSelected = selectedRole === role.id;
          return (
            <div
              key={role.id}
              onClick={() => setSelectedRole(role.id)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
                isSelected
                  ? 'bg-slate-900 border-indigo-500 shadow-xl shadow-indigo-500/10'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    role.id === 'super_admin' ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30' :
                    role.id === 'admin' ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30' :
                    role.id === 'member' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' :
                    'bg-slate-500/15 text-slate-400 border border-slate-500/30'
                  }`}>
                    {role.badge}
                  </span>
                  <h3 className="text-lg font-bold text-white mt-2 group-hover:text-indigo-300 transition-colors">
                    {role.name}
                  </h3>
                </div>

                <div className="p-2 rounded-xl bg-slate-800/80 text-slate-400">
                  <Shield className="h-4 w-4" />
                </div>
              </div>

              <p className="text-xs text-slate-400 mt-2.5 line-clamp-2">
                {role.description}
              </p>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-500">Active Users:</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/super-admin/users?role=${role.id}`);
                  }}
                  className="font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  <span>{role.usersCount} users</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Permissions Matrix Table */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/60">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="h-5 w-5 text-indigo-400" />
              <span>Comprehensive Permissions Grid</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Verified access rights mapped by operational domain and security boundary.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="flex items-center gap-1"><Check className="h-3.5 w-3.5 text-emerald-400" /> Granted</span>
            <span className="mx-1">•</span>
            <span className="flex items-center gap-1"><X className="h-3.5 w-3.5 text-rose-500" /> Prohibited</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-950 text-xs uppercase font-semibold text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-6 w-1/3">Capability / Operation</th>
                <th className="py-3.5 px-4 text-center">Super Admin</th>
                <th className="py-3.5 px-4 text-center">Admin</th>
                <th className="py-3.5 px-4 text-center">Member</th>
                <th className="py-3.5 px-4 text-center">Viewer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {categories?.map((cat, catIdx) => (
                <React.Fragment key={catIdx}>
                  {/* Category Header Row */}
                  <tr className="bg-slate-950/40">
                    <td colSpan="5" className="py-3 px-6 font-bold uppercase tracking-wider text-indigo-300 text-[11px]">
                      {cat.name}
                      <span className="ml-2 font-normal text-slate-500 normal-case">
                        — {cat.description}
                      </span>
                    </td>
                  </tr>

                  {/* Capability Rows */}
                  {cat.permissions.map((perm) => (
                    <tr key={perm.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-6 font-medium text-slate-200">
                        {perm.name}
                      </td>

                      {/* Super Admin */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-emerald-500/10 text-emerald-400">
                          <Check className="h-4 w-4" />
                        </span>
                      </td>

                      {/* Admin */}
                      <td className="py-3.5 px-4 text-center">
                        {perm.admin ? (
                          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-emerald-500/10 text-emerald-400">
                            <Check className="h-4 w-4" />
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-rose-500/10 text-rose-500">
                            <X className="h-4 w-4" />
                          </span>
                        )}
                      </td>

                      {/* Member */}
                      <td className="py-3.5 px-4 text-center">
                        {perm.member ? (
                          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-emerald-500/10 text-emerald-400">
                            <Check className="h-4 w-4" />
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-rose-500/10 text-rose-500">
                            <X className="h-4 w-4" />
                          </span>
                        )}
                      </td>

                      {/* Viewer */}
                      <td className="py-3.5 px-4 text-center">
                        {perm.viewer ? (
                          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-emerald-500/10 text-emerald-400">
                            <Check className="h-4 w-4" />
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-rose-500/10 text-rose-500">
                            <X className="h-4 w-4" />
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Policy Guardrails Notice Box */}
      <div className="p-5 rounded-2xl bg-indigo-950/30 border border-indigo-900/40 flex items-start gap-4">
        <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
          <Info className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-white">Hierarchical RBAC Enforcement</h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            All Super Admin actions are cryptographically validated by JWT Bearer claims and verified against the backend MongoDB platform role schema.
            Self-demotion, self-deactivation, and deletion of the sole active Super Admin are strictly blocked at the API layer.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RolesPermissionsPage;
