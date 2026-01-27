import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const services = [
    {
        slug: 'BUILDING_PERMIT',
        nameAr: 'تصريح بناء',
        nameEn: 'Building Permit',
        descriptionAr: 'طلب ترخيص بناء جديد',
        descriptionEn: 'Request for a new building permit',
    },
    {
        slug: 'RENOVATION_PERMIT',
        nameAr: 'تصريح ترميم',
        nameEn: 'Renovation Permit',
        descriptionAr: 'طلب ترخيص أعمال ترميم',
        descriptionEn: 'Request for renovation works',
    },
    {
        slug: 'DEMOLITION_PERMIT',
        nameAr: 'تصريح هدم',
        nameEn: 'Demolition Permit',
        descriptionAr: 'طلب ترخيص هدم مبنى',
        descriptionEn: 'Request for building demolition',
    },
    {
        slug: 'LAND_DIVISION',
        nameAr: 'إفراز أراضي',
        nameEn: 'Land Division',
        descriptionAr: 'طلب تقسيم وإفراز قطعة أرض',
        descriptionEn: 'Request for land division',
    },
    {
        slug: 'OTHER',
        nameAr: 'خدمة أخرى',
        nameEn: 'Other Service',
        descriptionAr: 'طلب خدمة عامة أخرى',
        descriptionEn: 'Other general service request',
    },
    {
        slug: 'MAYOR_MEETING',
        nameAr: 'لقاء رئيس البلدية',
        nameEn: 'Mayor Meeting',
        descriptionAr: 'حجز موعد لمقابلة رئيس البلدية',
        descriptionEn: 'Book a meeting with the Mayor',
    },
    {
        slug: 'ENGINEERING',
        nameAr: 'الدائرة الهندسية',
        nameEn: 'Engineering Dept',
        descriptionAr: 'مراجعة الدائرة الهندسية',
        descriptionEn: 'Visit Engineering Department',
    },
    {
        slug: 'FINANCE',
        nameAr: 'الدائرة المالية',
        nameEn: 'Finance Dept',
        descriptionAr: 'مراجعة الدائرة المالية',
        descriptionEn: 'Visit Finance Department',
    },
    {
        slug: 'COMPLAINT_FOLLOWUP',
        nameAr: 'متابعة شكوى',
        nameEn: 'Complaint Follow-up',
        descriptionAr: 'متابعة شكوى سابقة',
        descriptionEn: 'Follow up on a submitted complaint',
    },
];

async function main() {
    console.log('🌱 Seeding Service Types...');

    for (const service of services) {
        await prisma.serviceType.upsert({
            where: { slug: service.slug },
            update: service,
            create: service,
        });
        console.log(`Synced service: ${service.slug}`);
    }

    console.log('✅ Service Types seeded successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
