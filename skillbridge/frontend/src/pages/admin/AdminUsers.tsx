import React, { useEffect, useState } from 'react';
import { Topbar } from '../../components/layout/Topbar';
import { PageLoader } from '../../components/ui/Spinner';
import { Badge } from '../../components/ui/Badge';
import { usersAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Search, Users, GraduationCap } from 'lucide-react';

export default function AdminUsers() {
  const { user } = useAuth();
  const isAcademician = user?.role === 'ACADEMICIAN';

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState(isAcademician ? 'STUDENT' : '');

  const load = async () => {
    const activeRole = isAcademician ? 'STUDENT' : (roleFilter || undefined);
    const res = await usersAPI.getAll({ search, role: activeRole, limit: 50 });
    setUsers(res.data.users || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [search, roleFilter]);

  const roleBadge: Record<string, any> = { STUDENT: 'blue', RECRUITER: 'teal', ACADEMICIAN: 'purple', ADMIN: 'gray' };

  if (loading) return <><Topbar title={isAcademician ? "Student Cohort Directory" : "Users"} /><PageLoader /></>;

  return (
    <div>
      <Topbar 
        title={isAcademician ? "Student Cohort Directory" : "User Management"} 
        subtitle={isAcademician ? `${users.length} enrolled students monitored` : `${users.length} users registered`} 
      />
      <div className="p-6">
        <div className="flex gap-3 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input className="input pl-9" placeholder={isAcademician ? "Search enrolled students by name or email..." : "Search by name or email..."} value={search}
              onChange={e => setSearch(e.target.value)} />
          </div>
          {!isAcademician && (
            <select className="input w-40" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
              <option value="">All Roles</option>
              <option value="STUDENT">Students</option>
              <option value="RECRUITER">Recruiters</option>
              <option value="ACADEMICIAN">Academicians</option>
              <option value="ADMIN">Admins</option>
            </select>
          )}
        </div>

        <div className="card overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u: any) => (
                <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-navy-900 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {u.name?.charAt(0)}
                      </div>
                      <span className="font-medium text-gray-900">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-gray-500">{u.email}</td>
                  <td className="px-6 py-3"><Badge variant={roleBadge[u.role] || 'gray'}>{u.role}</Badge></td>
                  <td className="px-6 py-3 text-gray-500">{new Date(u.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <div className="text-center py-12 text-gray-500">No users found</div>
          )}
        </div>
      </div>
    </div>
  );
}
