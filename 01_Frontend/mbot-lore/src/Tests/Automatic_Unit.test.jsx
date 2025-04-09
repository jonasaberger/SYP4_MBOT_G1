import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Automatic from "../Automatic";
import { deleteRoute, getRoutes, sendCommand, sendEndRouteCommand } from "../../API_Service/service";

// Mock API functions
jest.mock("../../API_Service/service", () => ({
  deleteRoute: jest.fn(),
  getRoutes: jest.fn(),
  sendCommand: jest.fn(),
  sendEndRouteCommand: jest.fn(),
}));

describe("Automatic Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders the Automatic component with initial elements", () => {
    render(<Automatic />);
    expect(screen.getByText("Define Route")).toBeInTheDocument();
    expect(screen.getByText("Select Route ▼")).toBeInTheDocument();
    expect(screen.getByText("Drive")).toBeInTheDocument();
  });

  test("fetches routes on mount", async () => {
    const mockRoutes = ["Route1", "Route2"];
    getRoutes.mockResolvedValueOnce(mockRoutes);

    render(<Automatic />);

    await waitFor(() => {
      expect(getRoutes).toHaveBeenCalledTimes(1);
      expect(screen.getByText("Route1")).toBeInTheDocument();
      expect(screen.getByText("Route2")).toBeInTheDocument();
    });
  });

  test("handles route selection", async () => {
    const mockRoutes = ["Route1", "Route2"];
    getRoutes.mockResolvedValueOnce(mockRoutes);

    render(<Automatic />);

    await waitFor(() => {
      fireEvent.click(screen.getByText("Select Route ▼"));
      fireEvent.click(screen.getByText("Route1"));
    });

    expect(screen.getByText("Route1 ▼")).toBeInTheDocument();
  });

  test("handles route deletion", async () => {
    const mockRoutes = ["Route1", "Route2"];
    getRoutes.mockResolvedValueOnce(mockRoutes);
    deleteRoute.mockResolvedValueOnce();

    render(<Automatic />);

    await waitFor(() => {
      fireEvent.click(screen.getByText("Select Route ▼"));
      fireEvent.click(screen.getByText("🗑", { selector: "button" }));
    });

    await waitFor(() => {
      expect(deleteRoute).toHaveBeenCalledWith("Route1");
      expect(screen.queryByText("Route1")).not.toBeInTheDocument();
    });
  });

  test("handles Drive button functionality", async () => {
    const mockRoutes = ["Route1"];
    getRoutes.mockResolvedValueOnce(mockRoutes);

    render(<Automatic />);

    await waitFor(() => {
      fireEvent.click(screen.getByText("Select Route ▼"));
      fireEvent.click(screen.getByText("Route1"));
    });

    fireEvent.click(screen.getByText("Drive"));

    await waitFor(() => {
      expect(sendCommand).toHaveBeenCalledWith("route", "Route1");
      expect(screen.getByText("Stop")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Stop"));

    await waitFor(() => {
      expect(sendEndRouteCommand).toHaveBeenCalledTimes(1);
      expect(screen.getByText("Drive")).toBeInTheDocument();
    });
  });

  test("visualizes direction changes with arrow keys", async () => {
    render(<Automatic />);

    fireEvent.keyDown(window, { key: "ArrowUp" });
    expect(screen.getByAltText("Robot facing forward")).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "ArrowLeft" });
    expect(screen.getByAltText("Robot facing left")).toBeInTheDocument();

    fireEvent.keyUp(window, { key: "ArrowLeft" });
    expect(screen.getByAltText("Robot facing forward")).toBeInTheDocument();
  });
});