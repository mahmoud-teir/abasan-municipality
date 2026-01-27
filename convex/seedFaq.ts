
import { mutation } from "./_generated/server";

export const seed = mutation({
    args: {},
    handler: async (ctx) => {
        const FAQs = [
            { question: "ما هي أوقات العمل؟", answer: "نعمل من السبت إلى الخميس من 8:00 ص إلى 2:00 م.", isAdminOnly: false },
            { question: "كيف يمكنني تقديم شكوى؟", answer: "يمكنك تقديم شكوى عبر الموقع بعد تسجيل الدخول، أو زيارة المكتب.", isAdminOnly: false },
            { question: "المستندات المطلوبة للترخيص؟", answer: "الهوية، سند الملكية، ومخطط هندسي.", isAdminOnly: false }, // General
            { question: "رد سريع: تم الاستلام", answer: "تم استلام طلبك وبانتظار المراجعة.", isAdminOnly: true },
            { question: "رد سريع: مراجعة الدائرة", answer: "يرجى مراجعة الدائرة الهندسية لاستكمال الإجراءات.", isAdminOnly: true },
        ];

        for (const faq of FAQs) {
            await ctx.db.insert("canned_responses", faq);
        }
    },
});
