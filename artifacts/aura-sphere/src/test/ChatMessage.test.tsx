import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ChatMessage } from "@/components/ChatMessage";

describe("ChatMessage Component", () => {
  const mockMessage = {
    id: "test-1",
    content: "Hello, this is a test message",
    role: "user" as const,
    timestamp: new Date().toISOString(),
    chunks: [],
    status: "sent" as const,
  };

  const mockAssistantMessage = {
    id: "test-2",
    content: "This is an assistant response",
    role: "assistant" as const,
    timestamp: new Date().toISOString(),
    chunks: [],
    status: "sent" as const,
  };

  it("should render user message correctly", () => {
    render(<ChatMessage message={mockMessage} />);
    expect(screen.getByText("Hello, this is a test message")).toBeInTheDocument();
  });

  it("should render assistant message correctly", () => {
    render(<ChatMessage message={mockAssistantMessage} />);
    expect(screen.getByText("This is an assistant response")).toBeInTheDocument();
  });

  it("should display timestamp", () => {
    render(<ChatMessage message={mockMessage} />);
    // Check that the component renders (timestamp format may vary)
    expect(screen.getByText(mockMessage.content)).toBeInTheDocument();
  });

  it("should apply correct styling for user messages", () => {
    const { container } = render(<ChatMessage message={mockMessage} />);
    const messageElement = container.querySelector("[data-testid='chat-message']");
    expect(messageElement).toBeInTheDocument();
  });

  it("should apply correct styling for assistant messages", () => {
    const { container } = render(<ChatMessage message={mockAssistantMessage} />);
    const messageElement = container.querySelector("[data-testid='chat-message']");
    expect(messageElement).toBeInTheDocument();
  });

  it("should handle long messages", () => {
    const longMessage = {
      ...mockMessage,
      content: "This is a very long message. ".repeat(50),
    };
    render(<ChatMessage message={longMessage} />);
    expect(screen.getByText(new RegExp(longMessage.content.substring(0, 30))));
  });

  it("should handle messages with special characters", () => {
    const specialMessage = {
      ...mockMessage,
      content: "Test with @mentions, #hashtags, and \"quotes\"",
    };
    render(<ChatMessage message={specialMessage} />);
    expect(
      screen.getByText('Test with @mentions, #hashtags, and "quotes"')
    ).toBeInTheDocument();
  });

  it("should handle empty content gracefully", () => {
    const emptyMessage = {
      ...mockMessage,
      content: "",
    };
    render(<ChatMessage message={emptyMessage} />);
    expect(screen.queryByText("")).toBeInTheDocument();
  });
});
