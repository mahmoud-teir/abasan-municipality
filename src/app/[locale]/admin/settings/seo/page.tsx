import { getPageSeo } from "@/actions/seo.actions";
import { SeoForm } from "@/components/admin/seo/seo-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getTranslations } from "next-intl/server";

export default async function SeoSettingsPage() {
    const t = await getTranslations();
    const homeSeo = await getPageSeo('home');
    const aboutSeo = await getPageSeo('about');
    const servicesSeo = await getPageSeo('services');

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">SEO Management</h1>
                <p className="text-muted-foreground">Manage meta tags and search engine settings for your pages.</p>
            </div>

            <Tabs defaultValue="home" className="w-full">
                <TabsList className="grid w-full grid-cols-3 max-w-[400px]">
                    <TabsTrigger value="home">Home</TabsTrigger>
                    <TabsTrigger value="about">About</TabsTrigger>
                    <TabsTrigger value="services">Services</TabsTrigger>
                </TabsList>
                <TabsContent value="home" className="mt-6">
                    <SeoForm initialData={homeSeo.data || null} routeKey="home" />
                </TabsContent>
                <TabsContent value="about" className="mt-6">
                    <SeoForm initialData={aboutSeo.data || null} routeKey="about" />
                </TabsContent>
                <TabsContent value="services" className="mt-6">
                    <SeoForm initialData={servicesSeo.data || null} routeKey="services" />
                </TabsContent>
            </Tabs>
        </div>
    );
}
