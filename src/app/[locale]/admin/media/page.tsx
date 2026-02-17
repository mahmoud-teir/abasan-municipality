import { listMedia } from "@/actions/media.actions";
import { MediaLibrary } from "@/components/admin/media/media-library";
import { getTranslations } from "next-intl/server";

export default async function MediaPage() {
    const media = await listMedia(1, 20);
    const t = await getTranslations('admin.media');

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
                    <p className="text-muted-foreground">{t('subtitle')}</p>
                </div>
            </div>

            <MediaLibrary initialFiles={media.data || []} initialPagination={media.pagination || { total: 0, pages: 0, current: 1 }} />
        </div>
    );
}
