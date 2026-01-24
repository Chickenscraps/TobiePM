'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Permission {
    id: string;
    code: string;
    name: string;
    description: string | null;
    category: string;
}

interface RoleData {
    id: string;
    name: string;
    description: string | null;
    userCount: number;
    permissions: string[];
}

interface RolePermissionEditorProps {
    role: RoleData;
    permissionsByCategory: Record<string, Permission[]>;
}

export function RolePermissionEditor({
    role,
    permissionsByCategory,
}: RolePermissionEditorProps) {
    const router = useRouter();
    const [permissions, setPermissions] = useState<Set<string>>(new Set(role.permissions));
    const [saving, setSaving] = useState(false);
    const [expanded, setExpanded] = useState(false);

    const handleToggle = async (permissionId: string) => {
        const newPermissions = new Set(permissions);

        if (newPermissions.has(permissionId)) {
            newPermissions.delete(permissionId);
        } else {
            newPermissions.add(permissionId);
        }

        setPermissions(newPermissions);

        // Auto-save
        setSaving(true);
        try {
            await fetch(`/api/roles/${role.id}/permissions`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ permissionIds: Array.from(newPermissions) }),
            });
            router.refresh();
        } catch (error) {
            console.error('Failed to update permissions:', error);
        } finally {
            setSaving(false);
        }
    };

    const toggleCategory = (category: string) => {
        const categoryPerms = permissionsByCategory[category] || [];
        const allSelected = categoryPerms.length > 0 && categoryPerms.every((p) => permissions.has(p.id));

        const newPermissions = new Set(permissions);

        if (allSelected) {
            categoryPerms.forEach((p) => newPermissions.delete(p.id));
        } else {
            categoryPerms.forEach((p) => newPermissions.add(p.id));
        }

        setPermissions(newPermissions);

        // Auto-save
        setSaving(true);
        fetch(`/api/roles/${role.id}/permissions`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ permissionIds: Array.from(newPermissions) }),
        })
            .then(() => router.refresh())
            .finally(() => setSaving(false));
    };

    return (
        <div className="card">
            {/* Header */}
            <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center gap-4">
                    <div>
                        <h3 className="font-semibold text-white">{role.name}</h3>
                        <p className="text-sm text-gray-400">
                            {role.description || 'No description'} • {role.userCount} user(s)
                        </p>
                    </div>
                    {saving && (
                        <span className="text-xs text-primary-400 flex items-center gap-1">
                            <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    fill="none"
                                />
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                            </svg>
                            Saving...
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-400">
                        {permissions.size} permissions
                    </span>
                    <svg
                        className={`w-5 h-5 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>

            {/* Expanded permissions grid */}
            {expanded && (
                <div className="mt-6 space-y-6">
                    {Object.entries(permissionsByCategory).map(([category, perms]) => {
                        const allSelected = perms.every((p) => permissions.has(p.id));
                        const someSelected = perms.some((p) => permissions.has(p.id));

                        return (
                            <div key={category}>
                                <div className="flex items-center gap-3 mb-3">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleCategory(category);
                                        }}
                                        className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${allSelected
                                            ? 'bg-primary-500 border-primary-500'
                                            : someSelected
                                                ? 'bg-primary-500/50 border-primary-500'
                                                : 'border-gray-600 hover:border-gray-500'
                                            }`}
                                    >
                                        {(allSelected || someSelected) && (
                                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </button>
                                    <span className="font-medium text-white">{category}</span>
                                </div>

                                <div className="grid grid-cols-2 gap-3 pl-8">
                                    {perms.map((perm) => (
                                        <label
                                            key={perm.id}
                                            className="flex items-start gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer transition-colors"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={permissions.has(perm.id)}
                                                onChange={() => handleToggle(perm.id)}
                                                className="mt-0.5 w-4 h-4 rounded border-gray-600 text-primary-500 focus:ring-primary-500 bg-transparent"
                                            />
                                            <div>
                                                <p className="text-sm font-medium text-white">{perm.name}</p>
                                                <p className="text-xs text-gray-400">{perm.description}</p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
