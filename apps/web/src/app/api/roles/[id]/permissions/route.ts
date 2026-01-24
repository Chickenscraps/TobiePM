import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/permissions';
import { updateRolePermissionsSchema } from '@tobie/shared';

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requirePermission('admin.manageRoles' as any);

        const { id } = await params;

        const body = await request.json();
        const validated = updateRolePermissionsSchema.parse(body);

        // Delete existing permissions
        await prisma.rolePermission.deleteMany({
            where: { roleId: id },
        });

        // Create new permissions
        if (validated.permissionIds.length > 0) {
            await prisma.rolePermission.createMany({
                data: validated.permissionIds.map((permissionId) => ({
                    roleId: id,
                    permissionId,
                })),
            });
        }

        // Log the change
        await prisma.auditLog.create({
            data: {
                eventType: 'ROLE_UPDATE',
                eventSource: 'web-portal',
                entityType: 'role',
                entityId: id,
                details: JSON.stringify({
                    action: 'Updated permissions',
                    permissionCount: validated.permissionIds.length,
                }),
            },
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        if (error.message === 'Permission denied') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        console.error('Error updating role permissions:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
