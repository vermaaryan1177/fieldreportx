import React from "react";
import { Alert } from "react-native";

import {
  fireEvent,
  render,
  waitFor,
} from "@testing-library/react-native";

import Sidebar from "@/app/screens/SideBar";

import { signOut } from "@/lib/auth";


// MOCK vector icons
jest.mock("@expo/vector-icons", () => {
  return {
    Ionicons: "Ionicons",
  };
});


// MOCK auth function
jest.mock("@/lib/auth", () => ({
  signOut: jest.fn(() => Promise.resolve()),
}));


// MOCK firebase
jest.mock("@/lib/firebase", () => ({
  auth: {
    currentUser: {
      uid: "123",
      email: "test@test.com",
      displayName: "Test User",
    },
  },
}));


// MOCK organisations
jest.mock("@/lib/db/organisations", () => ({
  getUserOrganisation: jest.fn(() =>
    Promise.resolve([])
  ),
}));


// MOCK store
jest.mock("@/lib/store", () => ({
  store: {
    currentOrgId: null,
    setCurrentOrgId: jest.fn(),
  },
}));


describe("Sidebar Unit Test", () => {

  test("calls signOut when user confirms sign out", async () => {

    // mock alert popup
    jest.spyOn(Alert, "alert").mockImplementation(
      (_title, _message, buttons) => {

        const signOutButton = buttons?.[1];

        if (
          signOutButton &&
          "onPress" in signOutButton &&
          signOutButton.onPress
        ) {
          signOutButton.onPress();
        }
      }
    );

    const mockOnSignOut = jest.fn();

    const { getByTestId } = render(
      <Sidebar
        active="home"
        onNavigate={jest.fn()}
        onSignOut={mockOnSignOut}
      />
    );

    fireEvent.press(
      getByTestId("signout-button")
    );

    await waitFor(() => {
      expect(signOut).toHaveBeenCalled();
    });

  });

});