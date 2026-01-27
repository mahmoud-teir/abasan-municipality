import { BetterAuthPlugin } from "better-auth";
import { APIError } from "better-auth/api";
import prisma from "@/lib/db/prisma";

export const banPlugin = {
    id: "ban-plugin",
    hooks: {
        before: [
            {
                matcher: (context) => {
                    const path = context.path || "";
                    return path.startsWith("/sign-in/email");
                },
                handler: async (ctx: any) => {
                    console.log("[BanPlugin] Before hook triggered for:", ctx?.path);
                    try {
                        const body = ctx.body;
                        if (!body || !body.email) {
                            console.log("[BanPlugin] No email in body, skipping.");
                            return;
                        }

                        const user = await prisma.user.findUnique({
                            where: { email: body.email },
                            select: { isBanned: true }
                        });

                        if (user?.isBanned) {
                            console.warn("[BanPlugin] User is banned:", body.email);
                            throw new APIError("BAD_REQUEST", { message: "User is banned. Please contact support." });
                        }
                    } catch (e) {
                        if (e instanceof APIError) throw e;
                        console.error("[BanPlugin] Error in before hook:", e);
                    }
                }
            }
        ],
        after: []
    }
} satisfies BetterAuthPlugin;
