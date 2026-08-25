import { redirect } from "next/navigation";

/**
 * Theme templates were replaced by the single Theme Studio. Keep the old URL
 * as a safe redirect so existing bookmarks do not break, but do not expose a
 * second admin page that can overwrite the active palette.
 */
export default function ThemeTemplatesRedirect() {
    redirect("/admin/theme-settings");
}
