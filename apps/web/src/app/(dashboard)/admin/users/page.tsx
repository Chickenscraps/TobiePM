import { prisma } from '@/lib/prisma';
import { hasPermission } from '@/lib/permissions';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function AdminUsersPage() {
    const canView = await hasPermission('admin.viewUsers' as any);
    const canEdit = await hasPermission('admin.editUsers' as any);
    const canManageRoles = await hasPermission('admin.manageRoles' as any);

    if (!canView) {
        redirect('/dashboard');
    }

    const users = await prisma.user.findMany({
        include: {
            role: {
                include: {
                    permissions: {
                        include: { permission: true },
                    },
                },
            },
        },
        orderBy: { createdAt: 'asc' },
    });

    const roles = await prisma.role.findMany({
        include: {
            permissions: {
                include: { permission: true },
            },
        },
    });

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Users</h1>
                    <p className="text-gray-400 mt-1">Manage team members and their roles</p>
                </div>
                {canEdit && (
                    <Link href="/admin/users/new" className="btn-primary">
                        + Add User
                    </Link>
                )}
            </div>

            {/* Users Table */}
            <div className="card overflow-hidden p-0">
                <table className="w-full">
                    <thead className="bg-white/5">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                User
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                Role
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                Permissions
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                Last Login
                            </th>
                            {canEdit && (
                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                    Actions
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                                            <span className="text-white font-medium">
                                                {user.name.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="font-medium text-white">{user.name}</p>
                                            <p className="text-sm text-gray-400">{user.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`badge ${user.role.name === 'Admin' ? 'badge-blue' : 'badge-gray'}`}>
                                        {user.role.name}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-wrap gap-1">
                                        {user.role.permissions.slice(0, 3).map((rp) => (
                                            <span key={rp.permission.id} className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded">
                                                {rp.permission.name}
                                            </span>
                                        ))}
                                        {user.role.permissions.length > 3 && (
                                            <span className="text-xs text-gray-500">
                                                +{user.role.permissions.length - 3} more
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-400">
                                    {user.lastLoginAt
                                        ? new Date(user.lastLoginAt).toLocaleDateString()
                                        : 'Never'}
                                </td>
                                {canEdit && (
                                    <td className="px-6 py-4 text-right">
                                        <Link
                                            href={`/admin/users/${user.id}`}
                                            className="text-primary-400 hover:text-primary-300 text-sm"
                                        >
                                            Edit
                                        </Link>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Roles Section */}
            {canManageRoles && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-white">Roles & Permissions</h2>
                        <Link href="/admin/roles" className="btn-secondary text-sm">
                            Manage Roles
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {roles.map((role) => (
                            <div key={role.id} className="card">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold text-white">{role.name}</h3>
                                    <span className="text-sm text-gray-400">
                                        {role.permissions.length} permissions
                                    </span>
                                </div>
                                <p className="text-sm text-gray-400 mb-4">
                                    {role.description || 'No description'}
                                </p>
                                <div className="flex flex-wrap gap-1">
                                    {role.permissions.map((rp) => (
                                        <span
                                            key={rp.permission.id}
                                            className="text-xs text-gray-400 bg-white/5 px-2 py-1 rounded"
                                        >
                                            {rp.permission.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
