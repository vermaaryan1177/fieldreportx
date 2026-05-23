/**
 * Integration test — User authentication flow
 */

import { FirebaseError } from "firebase/app";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile,
} from "firebase/auth";
import { setDoc } from "firebase/firestore";

import { getAuthErrorMessage, signIn, signUp } from "@/lib/auth";
import { sqliteDb } from "@/lib/db/database";

// ─── External boundary mocks ──────────────────────────────────────────────────

jest.mock("firebase/app", () => ({
    initializeApp: jest.fn(() => ({})),
    FirebaseError: class FirebaseError extends Error {
        code: string;
        constructor(code: string, message: string) {
            super(message);
            this.code = code;
            this.name = "FirebaseError";
        }
    },
}));

jest.mock("firebase/auth", () => ({
    getAuth: jest.fn(() => ({})),
    createUserWithEmailAndPassword: jest.fn(),
    updateProfile: jest.fn(),
    signInWithEmailAndPassword: jest.fn(),
    sendPasswordResetEmail: jest.fn(),
    signOut: jest.fn(),
}));

jest.mock("firebase/firestore", () => ({
    getFirestore: jest.fn(() => ({})),
    doc: jest.fn(() => "mock-doc-ref"),
    setDoc: jest.fn(),
    getDoc: jest.fn(),
    updateDoc: jest.fn(),
}));

jest.mock("firebase/storage", () => ({
    getStorage: jest.fn(() => ({})),
}));

// Mock SQLite so no real DB file is touched
jest.mock("@/lib/db/database", () => ({
    sqliteDb: {
        execSync: jest.fn(),
        runAsync: jest.fn().mockResolvedValue(undefined),
        getFirstAsync: jest.fn().mockResolvedValue(null),
    },
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

const mockedCreateUser = jest.mocked(createUserWithEmailAndPassword);
const mockedUpdateProfile = jest.mocked(updateProfile);
const mockedSignIn = jest.mocked(signInWithEmailAndPassword);
const mockedSetDoc = jest.mocked(setDoc);
const mockedRunAsync = jest.mocked(sqliteDb.runAsync);

const FAKE_UID = "uid-abc-123";
const FAKE_USER = { uid: FAKE_UID, displayName: null, email: "jane@test.com" };

beforeEach(() => {
    jest.clearAllMocks();
    mockedCreateUser.mockResolvedValue({ user: FAKE_USER } as any);
    mockedUpdateProfile.mockResolvedValue(undefined);
    mockedSetDoc.mockResolvedValue(undefined);
    mockedRunAsync.mockResolvedValue(undefined as any);
});

// ─── signUp ───────────────────────────────────────────────────────────────────

describe("signUp", () => {
    it("calls Firebase Auth with the correct email and password", async () => {
        await signUp("Jane Smith", "jane@test.com", "secret123");

        expect(mockedCreateUser).toHaveBeenCalledTimes(1);
        expect(mockedCreateUser).toHaveBeenCalledWith(
            expect.anything(), // auth instance
            "jane@test.com",
            "secret123",
        );
    });

    it("trims whitespace from name and email before sending to Firebase", async () => {
        await signUp("  Jane Smith  ", "  jane@test.com  ", "secret123");

        expect(mockedCreateUser).toHaveBeenCalledWith(
            expect.anything(),
            "jane@test.com", // trimmed
            "secret123",
        );
        expect(mockedUpdateProfile).toHaveBeenCalledWith(
            FAKE_USER,
            { displayName: "Jane Smith" }, // trimmed
        );
    });

    it("sets the display name on the Firebase Auth user", async () => {
        await signUp("Jane Smith", "jane@test.com", "secret123");

        expect(mockedUpdateProfile).toHaveBeenCalledTimes(1);
        expect(mockedUpdateProfile).toHaveBeenCalledWith(FAKE_USER, {
            displayName: "Jane Smith",
        });
    });

    it("creates a Firestore user profile with the correct structure", async () => {
        await signUp("Jane Smith", "jane@test.com", "secret123");

        expect(mockedSetDoc).toHaveBeenCalledTimes(1);

        const profileArg = mockedSetDoc.mock.calls[0][1] as Record<
            string,
            unknown
        >;
        expect(profileArg.uid).toBe(FAKE_UID);
        expect(profileArg.displayName).toBe("Jane Smith");
        expect(profileArg.email).toBe("jane@test.com");
        expect(profileArg.role).toBe("inspector");
        expect(profileArg.onboardingComplete).toBe(false);
        expect(profileArg.organisationId).toBeNull();
        expect(typeof profileArg.createdAt).toBe("number");
    });

    it("caches the user profile in SQLite after Firestore write", async () => {
        await signUp("Jane Smith", "jane@test.com", "secret123");

        // Firestore write must come before the SQLite cache
        expect(mockedSetDoc.mock.invocationCallOrder[0]).toBeLessThan(
            mockedRunAsync.mock.invocationCallOrder[0],
        );
        expect(mockedRunAsync).toHaveBeenCalledTimes(1);

        expect(mockedRunAsync).toHaveBeenCalledWith(
            expect.stringContaining("INSERT OR REPLACE INTO users"),
            expect.arrayContaining([FAKE_UID]),
        );
    });

    it("propagates a Firebase error when account creation fails", async () => {
        mockedCreateUser.mockRejectedValueOnce(
            new FirebaseError("auth/email-already-in-use", "Email in use"),
        );

        await expect(
            signUp("Jane", "jane@test.com", "secret123"),
        ).rejects.toThrow(FirebaseError);
        // Profile must NOT be created if auth failed
        expect(mockedSetDoc).not.toHaveBeenCalled();
        expect(mockedRunAsync).not.toHaveBeenCalled();
    });
});

// ─── signIn ───────────────────────────────────────────────────────────────────

describe("signIn", () => {
    it("calls Firebase Auth with trimmed email and password", async () => {
        mockedSignIn.mockResolvedValueOnce({ user: FAKE_USER } as any);

        await signIn("  jane@test.com  ", "secret123");

        expect(mockedSignIn).toHaveBeenCalledWith(
            expect.anything(),
            "jane@test.com", // trimmed
            "secret123",
        );
    });

    it("propagates a Firebase error on wrong password", async () => {
        mockedSignIn.mockRejectedValueOnce(
            new FirebaseError("auth/wrong-password", "Wrong password"),
        );

        await expect(signIn("jane@test.com", "wrongpass")).rejects.toThrow(
            FirebaseError,
        );
    });
});

// ─── getAuthErrorMessage ──────────────────────────────────────────────────────

describe("getAuthErrorMessage", () => {
    const cases: [string, string][] = [
        [
            "auth/email-already-in-use",
            "An account with this email already exists.",
        ],
        ["auth/invalid-email", "Please enter a valid email address."],
        ["auth/weak-password", "Password must be at least 6 characters."],
        ["auth/user-not-found", "Incorrect email or password."],
        ["auth/wrong-password", "Incorrect email or password."],
        ["auth/invalid-credential", "Incorrect email or password."],
        [
            "auth/too-many-requests",
            "Too many failed attempts. Please try again later.",
        ],
        [
            "auth/network-request-failed",
            "No internet connection. Check your network and retry.",
        ],
    ];

    it.each(cases)(
        "maps '%s' to the correct user-facing message",
        (code, expected) => {
            const error = new FirebaseError(code, "raw firebase message");
            expect(getAuthErrorMessage(error)).toBe(expected);
        },
    );

    it("returns a generic message for unknown Firebase error codes", () => {
        const error = new FirebaseError("auth/some-unknown-code", "unknown");
        expect(getAuthErrorMessage(error)).toBe(
            "Authentication failed. Please try again.",
        );
    });

    it("returns a generic message for non-Firebase errors", () => {
        expect(getAuthErrorMessage(new Error("network error"))).toBe(
            "An unexpected error occurred.",
        );
        expect(getAuthErrorMessage("a string error")).toBe(
            "An unexpected error occurred.",
        );
        expect(getAuthErrorMessage(null)).toBe("An unexpected error occurred.");
    });
});
