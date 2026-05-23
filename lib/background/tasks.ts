import AsyncStorage from "@react-native-async-storage/async-storage";
import * as BackgroundFetch from "expo-background-fetch";
import * as Notifications from "expo-notifications";
import * as TaskManager from "expo-task-manager";

import { listReportsByUser } from "@/lib/db/reports";
import { listTemplates } from "@/lib/db/templates";
import { auth } from "@/lib/firebase";
import { toMs } from "@/lib/utils/time";

// ─── Task names ───────────────────────────────────────────────────────────────

export const TASK_DRAFT_CLEANUP = "fieldreportx-draft-cleanup";
export const TASK_TEMPLATE_POLL = "fieldreportx-template-poll";

// ─── AsyncStorage keys ────────────────────────────────────────────────────────

const KEY_TEMPLATE_COUNT = "bg:templateCount";
const KEY_TEMPLATE_ORG = "bg:templateOrgId";

// ─── Task: stale draft cleanup ────────────────────────────────────────────────
//
// Finds any "inprogress" reports that haven't been touched in 7 days and
// archives them so the user's list doesn't fill up with forgotten drafts.

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

TaskManager.defineTask(TASK_DRAFT_CLEANUP, async () => {
    try {
        const uid = auth.currentUser?.uid;
        if (!uid) return BackgroundFetch.BackgroundFetchResult.NoData;

        const reports = await listReportsByUser(uid);
        const now = Date.now();
        const stale = reports.filter(
            (r) =>
                r.status === "inprogress" &&
                now - toMs(r.updatedAt) > SEVEN_DAYS_MS,
        );

        if (stale.length === 0) return BackgroundFetch.BackgroundFetchResult.NoData;

        const { archiveReport } = await import("@/lib/db/reports");
        await Promise.all(stale.map((r) => archiveReport(r.id)));

        await Notifications.scheduleNotificationAsync({
            content: {
                title: "Reports archived",
                body: `${stale.length} report${stale.length !== 1 ? "s" : ""} inactive for 7+ days were archived.`,
                data: { screen: "reports" },
            },
            trigger: null,
        });

        return BackgroundFetch.BackgroundFetchResult.NewData;
    } catch {
        return BackgroundFetch.BackgroundFetchResult.Failed;
    }
});

// ─── Task: org template poll ──────────────────────────────────────────────────
//
// Checks whether new templates have been added to the user's organisation
// since the last background run. Fires a local notification if so.

TaskManager.defineTask(TASK_TEMPLATE_POLL, async () => {
    try {
        const uid = auth.currentUser?.uid;
        if (!uid) return BackgroundFetch.BackgroundFetchResult.NoData;

        const orgId = await AsyncStorage.getItem(KEY_TEMPLATE_ORG);
        if (!orgId) return BackgroundFetch.BackgroundFetchResult.NoData;

        const templates = await listTemplates(uid, orgId);
        const currentCount = templates.length;

        const storedRaw = await AsyncStorage.getItem(KEY_TEMPLATE_COUNT);
        const previousCount = storedRaw !== null ? parseInt(storedRaw, 10) : currentCount;

        await AsyncStorage.setItem(KEY_TEMPLATE_COUNT, String(currentCount));

        const newCount = currentCount - previousCount;
        if (newCount <= 0) return BackgroundFetch.BackgroundFetchResult.NoData;

        await Notifications.scheduleNotificationAsync({
            content: {
                title: "New shared templates",
                body: `${newCount} new template${newCount !== 1 ? "s" : ""} ${newCount !== 1 ? "have" : "has"} been added to your organisation.`,
                data: { screen: "sharedTemplates" },
            },
            trigger: null,
        });

        return BackgroundFetch.BackgroundFetchResult.NewData;
    } catch {
        return BackgroundFetch.BackgroundFetchResult.Failed;
    }
});

// ─── Registration helpers ─────────────────────────────────────────────────────

export async function registerBackgroundTasks(orgId: string | null): Promise<void> {
    if (orgId) {
        await AsyncStorage.setItem(KEY_TEMPLATE_ORG, orgId);
    } else {
        await AsyncStorage.removeItem(KEY_TEMPLATE_ORG);
    }

    const opts: BackgroundFetch.BackgroundFetchOptions = {
        minimumInterval: 15 * 60,   // 15 minutes (OS may defer longer)
        stopOnTerminate: false,      // keep running after app is closed
        startOnBoot: true,           // re-register after device reboot
    };

    for (const taskName of [TASK_DRAFT_CLEANUP, TASK_TEMPLATE_POLL]) {
        const isRegistered = await TaskManager.isTaskRegisteredAsync(taskName);
        if (!isRegistered) {
            await BackgroundFetch.registerTaskAsync(taskName, opts);
        }
    }
}

export async function unregisterBackgroundTasks(): Promise<void> {
    for (const taskName of [TASK_DRAFT_CLEANUP, TASK_TEMPLATE_POLL]) {
        const isRegistered = await TaskManager.isTaskRegisteredAsync(taskName);
        if (isRegistered) {
            await BackgroundFetch.unregisterTaskAsync(taskName);
        }
    }
    await AsyncStorage.multiRemove([KEY_TEMPLATE_COUNT, KEY_TEMPLATE_ORG]);
}
