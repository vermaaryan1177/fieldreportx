import { useEffect, useRef } from "react";

const AD_UNIT_ID = __DEV__
    ? "ca-app-pub-3940256099942544/4411468910"
    : "ca-app-pub-3940256099942544/4411468910"; // replace with real unit ID before release

export function useTemplateAd(onAdClosed: () => void) {
    const adRef = useRef<any>(null);
    const closedCallbackRef = useRef(onAdClosed);
    closedCallbackRef.current = onAdClosed;

    useEffect(() => {
        let unsubLoaded: (() => void) | null = null;
        let unsubClosed: (() => void) | null = null;
        let unsubError: (() => void) | null = null;

        try {
            // Check inside the effect — avoids top-level module evaluation issues on Android.
            // TurboModuleRegistry.get returns null without throwing if module is absent.
            const { TurboModuleRegistry } = require("react-native");
            if (!TurboModuleRegistry.get("RNGoogleMobileAdsModule")) return;

            const { InterstitialAd, AdEventType } = require("react-native-google-mobile-ads");

            const ad = InterstitialAd.createForAdRequest(AD_UNIT_ID, {
                requestNonPersonalizedAdsOnly: true,
            });

            adRef.current = ad;

            unsubLoaded = ad.addAdEventListener(AdEventType.LOADED, () => {});
            unsubClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
                closedCallbackRef.current();
                ad.load();
            });
            unsubError = ad.addAdEventListener(AdEventType.ERROR, () => {
                closedCallbackRef.current();
            });

            ad.load();
        } catch {
            // Native module unavailable — skip ads
        }

        return () => {
            unsubLoaded?.();
            unsubClosed?.();
            unsubError?.();
        };
    }, []);

    const showAd = () => {
        const ad = adRef.current;
        if (ad?.loaded) {
            ad.show();
        } else {
            closedCallbackRef.current();
        }
    };

    return { showAd };
}
