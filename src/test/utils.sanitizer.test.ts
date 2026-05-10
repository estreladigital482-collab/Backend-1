import { describe, it, expect } from "vitest";
import { sanitizeText, sanitizeMemoryContent, sanitizeMessages } from "@/lib/utils";

describe("Data Sanitization Functions", () => {
  describe("sanitizeText", () => {
    it("should redact email addresses", () => {
      const text = "Contact me at user@example.com";
      const sanitized = sanitizeText(text);
      expect(sanitized).not.toContain("user@example.com");
      expect(sanitized).toContain("[EMAIL_REDACTED]");
    });

    it("should redact internal IP addresses", () => {
      const text = "Server IP: 192.168.1.1";
      const sanitized = sanitizeText(text);
      expect(sanitized).not.toContain("192.168.1.1");
      expect(sanitized).toContain("[INTERNAL_IP_REDACTED]");
    });

    it("should redact passwords", () => {
      const text = 'password: "MySecurePass123"';
      const sanitized = sanitizeText(text);
      expect(sanitized).toContain("[PASSWORD_REDACTED]");
    });

    it("should redact JWT tokens", () => {
      const text = "Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ";
      const sanitized = sanitizeText(text);
      expect(sanitized).toContain("[JWT_TOKEN_REDACTED]");
    });

    it("should preserve normal text", () => {
      const text = "This is a normal message";
      const sanitized = sanitizeText(text);
      expect(sanitized).toBe(text);
    });

    it("should handle empty string", () => {
      const sanitized = sanitizeText("");
      expect(sanitized).toBe("");
    });

    it("should redact phone numbers", () => {
      const text = "Call me at 555-123-4567";
      const sanitized = sanitizeText(text);
      expect(sanitized).toContain("[PHONE_REDACTED]");
    });
  });

  describe("sanitizeMemoryContent", () => {
    it("should sanitize email in memory content", () => {
      const content = "User email: admin@example.com";
      const sanitized = sanitizeMemoryContent(content);
      expect(sanitized).not.toContain("admin@example.com");
      expect(sanitized).toContain("[EMAIL_REDACTED]");
    });

    it("should handle DATABASE_URL redaction", () => {
      const content = 'DATABASE_URL="postgresql://user:pass@localhost/db"';
      const sanitized = sanitizeMemoryContent(content);
      expect(sanitized).toContain("[DATABASE_URL_REDACTED]");
    });
  });

  describe("sanitizeMessages", () => {
    it("should sanitize array of messages", () => {
      const messages = [
        { role: "user", content: "Email: user@example.com" },
        { role: "assistant", content: "Contact admin@site.com" },
      ];
      const sanitized = sanitizeMessages(messages);
      expect(sanitized[0].content).not.toContain("user@example.com");
      expect(sanitized[1].content).not.toContain("admin@site.com");
    });

    it("should preserve message structure", () => {
      const messages = [
        { role: "user", content: "Hello" },
        { role: "assistant", content: "Hi there" },
      ];
      const sanitized = sanitizeMessages(messages);
      expect(sanitized).toHaveLength(2);
      expect(sanitized[0].role).toBe("user");
      expect(sanitized[1].role).toBe("assistant");
    });
  });
});
