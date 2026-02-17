import { getHeroSlides } from "@/actions/hero.actions";
import { HeroSlideManager } from "@/components/admin/hero/hero-slide-manager";
import { getTranslations } from "next-intl/server";

export default async function HeroSettingsPage() {
    const { data: slides } = await getHeroSlides();
    const t = await getTranslations("admin.hero");

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
                    <p className="text-muted-foreground">{t('description')}</p>
                </div>
            </div>

            <HeroSlideManager initialSlides={slides || []} />
        </div>
    );
}
