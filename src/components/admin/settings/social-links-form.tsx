'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Facebook, Twitter, Instagram, Youtube, Globe, Save } from "lucide-react";
import { useTransition, useState } from "react";
import { updateSystemSetting } from "@/actions/settings.actions";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

type Props = {
    initialLinks: {
        facebook: string;
        twitter: string;
        instagram: string;
        youtube: string;
        website: string;
    }
};

export function SocialLinksForm({ initialLinks }: Props) {
    const t = useTranslations('admin.settingsPage.social');
    const [links, setLinks] = useState(initialLinks);
    const [isPending, startTransition] = useTransition();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        startTransition(async () => {
            // Update all settings in parallel
            await Promise.all([
                updateSystemSetting('social_facebook', links.facebook),
                updateSystemSetting('social_twitter', links.twitter),
                updateSystemSetting('social_instagram', links.instagram),
                updateSystemSetting('social_youtube', links.youtube),
                updateSystemSetting('social_website', links.website),
            ]);
            toast.success(t('success'));
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-blue-600" />
                    {t('title')}
                </CardTitle>
                <CardDescription>{t('description')}</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="facebook" className="flex items-center gap-2">
                                <Facebook className="w-4 h-4 text-blue-600" /> Facebook
                            </Label>
                            <Input
                                id="facebook"
                                value={links.facebook}
                                onChange={(e) => setLinks({ ...links, facebook: e.target.value })}
                                placeholder="https://facebook.com/..."
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="twitter" className="flex items-center gap-2">
                                <Twitter className="w-4 h-4 text-sky-500" /> Twitter (X)
                            </Label>
                            <Input
                                id="twitter"
                                value={links.twitter}
                                onChange={(e) => setLinks({ ...links, twitter: e.target.value })}
                                placeholder="https://twitter.com/..."
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="instagram" className="flex items-center gap-2">
                                <Instagram className="w-4 h-4 text-pink-600" /> Instagram
                            </Label>
                            <Input
                                id="instagram"
                                value={links.instagram}
                                onChange={(e) => setLinks({ ...links, instagram: e.target.value })}
                                placeholder="https://instagram.com/..."
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="youtube" className="flex items-center gap-2">
                                <Youtube className="w-4 h-4 text-red-600" /> Youtube
                            </Label>
                            <Input
                                id="youtube"
                                value={links.youtube}
                                onChange={(e) => setLinks({ ...links, youtube: e.target.value })}
                                placeholder="https://youtube.com/..."
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <Button type="submit" disabled={isPending}>
                            <Save className="w-4 h-4 ml-2" />
                            {isPending ? t('saving') : t('save')}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
