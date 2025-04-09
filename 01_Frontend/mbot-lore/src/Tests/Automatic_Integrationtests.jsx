import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import MainControl from "../MainControl";
import { sendCommand } from "../../API_Service/service";

// Mock API functions
jest.mock("../../API_Service/service", () => ({
  sendCommand: jest.fn(),
}));

describe("Integration Test for Automatic Mode", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("switches to Automatic mode and interacts with Automatic component", async () => {
    render(<MainControl />);

    // Switch to Automatic mode
    fireEvent.click(screen.getByText("Automatic"));

    await waitFor(() => {
      expect(sendCommand).toHaveBeenCalledWith("mode", "automatic");
    });

    // Verify Automatic component is rendered
    expect(screen.getByText("Define Route")).toBeInTheDocument();
    expect(screen.getByText("Select Route ▼")).toBeInTheDocument();
    expect(screen.getByText("Drive")).toBeInTheDocument();

    // Interact with Automatic component
    fireEvent.click(screen.getByText("Define Route"));
    expect(screen.getByText("Define Route Interface")).toBeInTheDocument();
  });
});