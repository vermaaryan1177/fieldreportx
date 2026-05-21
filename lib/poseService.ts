import * as poseDetection from "@tensorflow-models/pose-detection";
import * as tf from "@tensorflow/tfjs";
import { decodeJpeg } from "@tensorflow/tfjs-react-native";
import "@tensorflow/tfjs-react-native"; // registers the RN WebGL backend
import * as FileSystem from "expo-file-system/legacy";

// ─── Public types ─────────────────────────────────────────────────────────────

export interface PoseKeypoint {
    x: number; y: number; score: number; name: string;
}

export interface JointAngleCapture {
    joint: string;
    angle: number;
    confidence: number; // 0–1
    imageUri: string;
    origW: number;
    origH: number;
    keypoints: PoseKeypoint[];
    triplet: [number, number, number]; // proximal / vertex / distal indices
}

// ─── MoveNet skeleton for visualisation ──────────────────────────────────────

export const SKELETON_EDGES: [number, number][] = [
    [0, 1], [0, 2], [1, 3], [2, 4],          // face
    [5, 6], [5, 7], [7, 9], [6, 8], [8, 10], // arms
    [5, 11], [6, 12], [11, 12],               // torso
    [11, 13], [13, 15], [12, 14], [14, 16],   // legs
];

// ─── Joint keypoint triplets [proximal, vertex, distal] ──────────────────────
// Try each candidate pair; pick the side with the highest minimum confidence.

const JOINT_TRIPLETS: Record<string, Array<[number, number, number]>> = {
    Knee:     [[11, 13, 15], [12, 14, 16]],
    Shoulder: [[11, 5,  7 ], [12, 6,  8 ]],
    Elbow:    [[5,  7,  9 ], [6,  8,  10]],
    Hip:      [[5,  11, 13], [6,  12, 14]],
    Ankle:    [[13, 15, 11], [14, 16, 12]], // shin–ankle–knee angle
};

// Joints not well-supported by MoveNet (no hand/neck keypoints)
export const AI_UNSUPPORTED_JOINTS = ["Wrist", "Neck", "Lumbar"];

const INPUT_SIZE  = 256;
const MIN_SCORE   = 0.25;

// ─── Singleton detector ───────────────────────────────────────────────────────

let _detector: poseDetection.PoseDetector | null = null;
let _tfReady = false;

async function getDetector(): Promise<poseDetection.PoseDetector> {
    if (!_tfReady) {
        await tf.ready();
        _tfReady = true;
    }
    if (!_detector) {
        _detector = await poseDetection.createDetector(
            poseDetection.SupportedModels.MoveNet,
            { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING },
        );
    }
    return _detector;
}

// ─── Angle calculation ────────────────────────────────────────────────────────

function calcAngle(
    A: { x: number; y: number },
    B: { x: number; y: number },
    C: { x: number; y: number },
): number {
    const BAx = A.x - B.x, BAy = A.y - B.y;
    const BCx = C.x - B.x, BCy = C.y - B.y;
    const dot = BAx * BCx + BAy * BCy;
    const mag = Math.sqrt((BAx ** 2 + BAy ** 2) * (BCx ** 2 + BCy ** 2));
    if (mag < 1e-6) return 0;
    return Math.round(
        Math.acos(Math.max(-1, Math.min(1, dot / mag))) * (180 / Math.PI),
    );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export async function detectJointAngle(
    imageUri: string,
    joint: string,
    origW: number,
    origH: number,
): Promise<JointAngleCapture> {
    if (AI_UNSUPPORTED_JOINTS.includes(joint)) {
        throw new Error(
            `AI angle detection is not supported for ${joint}. ` +
            "Use manual measurement in the Angle Measurements section.",
        );
    }

    const detector = await getDetector();

    // Read image → base64 → Uint8Array → tensor
    const b64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: "base64" as any,
    });
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

    // Decode JPEG and resize to INPUT_SIZE × INPUT_SIZE
    let poses: poseDetection.Pose[];
    const decoded = decodeJpeg(bytes, 3);
    const resized = tf.image.resizeBilinear(
        decoded as tf.Tensor3D,
        [INPUT_SIZE, INPUT_SIZE],
    ) as tf.Tensor3D;
    decoded.dispose();

    try {
        poses = await detector.estimatePoses(resized);
    } finally {
        resized.dispose();
    }

    if (!poses.length) {
        throw new Error(
            "No person detected in the image. " +
            "Ensure the full limb is visible and well-lit.",
        );
    }

    const kps = poses[0].keypoints;

    // Pick the side (left/right) with the highest minimum keypoint confidence
    const triplets = JOINT_TRIPLETS[joint] ?? JOINT_TRIPLETS["Knee"];
    let bestTriplet: [number, number, number] = triplets[0];
    let bestScore = -1;

    for (const t of triplets) {
        const s = Math.min(
            kps[t[0]]?.score ?? 0,
            kps[t[1]]?.score ?? 0,
            kps[t[2]]?.score ?? 0,
        );
        if (s > bestScore) { bestScore = s; bestTriplet = t; }
    }

    if (bestScore < MIN_SCORE) {
        throw new Error(
            `${joint} joint not clearly visible ` +
            `(${Math.round(bestScore * 100)}% confidence). ` +
            "Try better lighting or a clearer side-on angle.",
        );
    }

    const [pIdx, vIdx, dIdx] = bestTriplet;
    const angle = calcAngle(kps[pIdx], kps[vIdx], kps[dIdx]);

    return {
        joint,
        angle,
        confidence: Math.round(bestScore * 100) / 100,
        imageUri,
        origW,
        origH,
        keypoints: kps.map((kp, i) => ({
            x: kp.x, y: kp.y,
            score: kp.score ?? 0,
            name: kp.name ?? `kp_${i}`,
        })),
        triplet: bestTriplet,
    };
}
