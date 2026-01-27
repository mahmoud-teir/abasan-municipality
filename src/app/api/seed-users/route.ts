import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

export async function GET() {
    try {
        const usersToCreate = [
            {
                email: "superadmin@abasan.mun.ps",
                name: "Super Admin",
                password: "password123",
                role: "SUPER_ADMIN"
            },
            {
                email: "admin@abasan.mun.ps",
                name: "System Admin",
                password: "password123",
                role: "ADMIN"
            },
            {
                email: "engineer@abasan.mun.ps",
                name: "Chief Engineer",
                password: "password123",
                role: "ENGINEER"
            },
            {
                email: "accountant@abasan.mun.ps",
                name: "Senior Accountant",
                password: "password123",
                role: "ACCOUNTANT"
            },
            {
                email: "pr@abasan.mun.ps",
                name: "PR Manager",
                password: "password123",
                role: "PR_MANAGER"
            },
            {
                email: "employee@abasan.mun.ps",
                name: "General Employee",
                password: "password123",
                role: "EMPLOYEE"
            },
            {
                email: "supervisor@abasan.mun.ps",
                name: "Supervisor User",
                password: "password123",
                role: "SUPERVISOR"
            },
            {
                email: "citizen@abasan.mun.ps",
                name: "Ahmed Citizen",
                password: "password123",
                role: "CITIZEN"
            }
        ];

        const results = [];

        for (const user of usersToCreate) {
            // Check if user exists to avoid duplicates/errors
            const existing = await prisma.user.findUnique({
                where: { email: user.email }
            });

            if (!existing) {
                // Create user using Better Auth API
                // We need to pass headers for context if required, though signUpEmail might not strictly need it in server-side calls if configured right?
                // Actually better-auth server side calls might be `auth.api.signUpEmail`

                // Using the API directly
                const res = await auth.api.signUpEmail({
                    body: {
                        email: user.email,
                        password: user.password,
                        name: user.name,
                    }
                    // We might need to handle role assignment MANUALLY after creation 
                    // because signUpEmail usually just creates a default user unless we configured it to accept role.
                });

                if (res && res.user) {
                    // Update role manually
                    await prisma.user.update({
                        where: { id: res.user.id },
                        data: { role: user.role as any }
                    });
                    results.push(`Created ${user.role}: ${user.email}`);
                } else {
                    results.push(`Failed to create ${user.email}`);
                }
            } else {
                // If exists, ensure role is correct
                await prisma.user.update({
                    where: { email: user.email },
                    data: { role: user.role as any }
                });
                results.push(`Updated ${user.email}`);
            }
        }

        // Seed additional dummy content related to these users
        // e.g. Requests for the citizen
        const citizenUser = await prisma.user.findUnique({ where: { email: 'citizen@abasan.mun.ps' } });
        if (citizenUser) {
            const requestCount = await prisma.request.count({ where: { userId: citizenUser.id } });
            if (requestCount === 0) {
                await prisma.request.createMany({
                    data: [
                        {
                            userId: citizenUser.id,
                            requestNo: `REQ-${new Date().getFullYear()}-0001`,
                            type: 'BUILDING_PERMIT',
                            status: 'PENDING',
                            propertyAddress: 'Al-Manara St, Block 4',
                            description: 'Building a new 2-story house'
                        },
                        {
                            userId: citizenUser.id,
                            requestNo: `REQ-${new Date().getFullYear()}-0002`,
                            type: 'RENOVATION_PERMIT',
                            status: 'APPROVED',
                            propertyAddress: 'Main St, Old City',
                            description: 'Renovating the facade'
                        }
                    ]
                });
                results.push('Seeded requests for citizen');
            }
        }


        return NextResponse.json({
            success: true,
            results,
            message: "Seeding completed. Passwords are 'password123'"
        });

    } catch (error: any) {
        console.error("Seeding error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
