import { useEffect, useRef } from "react";
import {
    AdEventType,
    InterstitialAd,
    TestIds,
} from "react-native-google-mobile-ads";

const AD_UNIT_ID = __DEV__
    ? TestIds.INTERSTITIAL
    : "ca-app-pub-3940256099942544/1033173712"; // replace with real unit ID before release

export function useTemplateAd(onAdClosed: () => void) {
    const adRef = useRef<InterstitialAd | null>(null);
    const closedCallbackRef = useRef(onAdClosed);
    closedCallbackRef.current = onAdClosed;

    useEffect(() => {
        const ad = InterstitialAd.createForAdRequest(AD_UNIT_ID, {
            requestNonPersonalizedAdsOnly: true,
        });

        adRef.current = ad;

        const unsubLoaded = ad.addAdEventListener(AdEventType.LOADED, () => {});
        const unsubClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
            closedCallbackRef.current();
            // Pre-load the next ad for future use
            ad.load();
        });
        const unsubError = ad.addAdEventListener(AdEventType.ERROR, () => {
            // Ad failed to load — proceed without showing one
            closedCallbackRef.current();
        });

        ad.load();

        return () => {
            unsubLoaded();
            unsubClosed();
            unsubError();
        };
    }, []);

    const showAd = () => {
        const ad = adRef.current;
        if (ad?.loaded) {
            ad.show();
        } else {
            // Ad not ready — skip it and proceed immediately
            closedCallbackRef.current();
        }
    };

    return { showAd };
}
