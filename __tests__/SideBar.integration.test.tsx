import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";

// ================= MOCKS =================

jest.mock("firebase/app", () => ({
  FirebaseError: class FirebaseError extends Error {},
}));

jest.mock("@/lib/auth", () => ({
  signOut: jest.fn(() => Promise.resolve()),
}));

jest.mock("@/lib/firebase", () => ({
  auth: {
    currentUser: {
      uid: "123",
      email: "test@test.com",
      displayName: "Test User",
    },
  },
}));

jest.mock("@/lib/db/organisations", () => ({
  getUserOrganisation: jest.fn(() => Promise.resolve([])),
}));

jest.mock("@/lib/store", () => ({
  store: {
    currentOrgId: null,
    setCurrentOrgId: jest.fn(),
  },
}));

jest.mock("@expo/vector-icons", () => ({
  Ionicons: "Ionicons",
}));

// ================= IMPORT =================

import Sidebar from "@/app/screens/SideBar";

// ================= TEST =================

describe("Sidebar Integration Test", () => {

  test("navigates to My Reports when pressed", async () => {

    const mockNavigate = jest.fn();

    const { getByText } = render(
      <Sidebar
        active="home"
        onNavigate={mockNavigate}
      />
    );

    // wait for async UI update
    await waitFor(() => {
      expect(getByText("My Reports")).toBeTruthy();
    });

    fireEvent.press(getByText("My Reports"));

    expect(mockNavigate).toHaveBeenCalledWith("reports");
  });

});