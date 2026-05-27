import Constants, { ExecutionEnvironment } from "expo-constants";
import { useEffect, useRef } from "react";

const AD_UNIT_ID = __DEV__
    ? "ca-app-pub-3940256099942544/4411468910"
    : "ca-app-pub-3940256099942544/4411468910"; // replace with real unit ID before release

const isExpoGo =
    Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

export function useTemplateAd(onAdClosed: () => void) {
    const adRef = useRef<any>(null);
    const closedCallbackRef = useRef(onAdClosed);
    const showRequestedRef = useRef(false);
    closedCallbackRef.current = onAdClosed;

    useEffect(() => {
        if (isExpoGo) {
            return;
        }

        let unsubLoaded: (() => void) | null = null;
        let unsubClosed: (() => void) | null = null;
        let unsubError: (() => void) | null = null;

        try {
            const {
                InterstitialAd,
                AdEventType,
            } = require("react-native-google-mobile-ads");

            const ad = InterstitialAd.createForAdRequest(AD_UNIT_ID, {
                requestNonPersonalizedAdsOnly: true,
            });

            adRef.current = ad;

            unsubLoaded = ad.addAdEventListener(AdEventType.LOADED, () => {
                if (showRequestedRef.current) {
                    showRequestedRef.current = false;
                    try {
                        ad.show();
                    } catch (e) {
                        closedCallbackRef.current();
                    }
                }
            });
            unsubClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
                closedCallbackRef.current();
                ad.load();
            });
            unsubError = ad.addAdEventListener(AdEventType.ERROR, (e: any) => {
                if (showRequestedRef.current) {
                    showRequestedRef.current = false;
                    closedCallbackRef.current();
                }
            });

            ad.load();
        } catch (e) {
            console.log("[AdMob] Setup error:", e);
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
            try {
                ad.show();
            } catch (e) {
                closedCallbackRef.current();
            }
        } else if (ad) {
            showRequestedRef.current = true;
        } else {
            closedCallbackRef.current();
        }
    };

    return { showAd };
}