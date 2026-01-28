import { getHeroSlides } from "@/actions/hero.actions";
import { HeroSlideManager } from "@/components/admin/hero/hero-slide-manager";

export default async function HeroSettingsPage() {
    const { data: slides } = await getHeroSlides();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Hero Slider</h1>
                    <p className="text-muted-foreground">Manage the images and text on the homepage slider.</p>
                </div>
            </div>

            <HeroSlideManager initialSlides={slides || []} />
        </div>
    );
}
