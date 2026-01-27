import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";

async function main() {
    console.log('🌱 Seeding Users Manually...');

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

    for (const user of usersToCreate) {
        try {
            const existing = await prisma.user.findUnique({
                where: { email: user.email }
            });

            if (!existing) {
                console.log(`Creating user: ${user.email}`);
                const res = await auth.api.signUpEmail({
                    body: {
                        email: user.email,
                        password: user.password,
                        name: user.name,
                    }
                });

                if (res && res.user) {
                    await prisma.user.update({
                        where: { id: res.user.id },
                        data: { role: user.role as any }
                    });
                    console.log(`✅ Created ${user.role}: ${user.email}`);
                } else {
                    console.error(`❌ Failed to create ${user.email}`);
                }
            } else {
                console.log(`User exists: ${user.email} - Updating role`);
                await prisma.user.update({
                    where: { email: user.email },
                    data: { role: user.role as any }
                });
            }
        } catch (e: any) {
            console.error(`Error processing ${user.email}:`, e.message);
        }
    }

    // Seed requests for citizen
    const citizenUser = await prisma.user.findUnique({ where: { email: 'citizen@abasan.mun.ps' } });
    if (citizenUser) {
        const requestCount = await prisma.request.count({ where: { userId: citizenUser.id } });
        if (requestCount === 0) {
            console.log('Seeding requests for citizen...');
            await prisma.request.createMany({
                data: [
                    {
                        userId: citizenUser.id,
                        requestNo: `REQ-${new Date().getFullYear()}-0001`,
                        type: 'BUILDING_PERMIT', // String slug, valid
                        status: 'PENDING',
                        propertyAddress: 'Al-Manara St, Block 4',
                        description: 'Building a new 2-story house'
                    },
                    {
                        userId: citizenUser.id,
                        requestNo: `REQ-${new Date().getFullYear()}-0002`,
                        type: 'RENOVATION_PERMIT', // String slug, valid
                        status: 'APPROVED',
                        propertyAddress: 'Main St, Old City',
                        description: 'Renovating the facade'
                    }
                ]
            });
            console.log('✅ Requests seeded.');
        } else {
            console.log('Requests already seeded.');
        }
    }

    console.log('🎉 Manual Seeding Completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
