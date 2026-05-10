"""
Data Sanitization Utilities

This module provides utilities to sanitize sensitive data before sending to external LLM providers.
Prevents accidental leakage of API keys, passwords, tokens, and other sensitive information.
"""

import re
from typing import Dict, List, Any, Union


class DataSanitizer:
    """Sanitizes sensitive data from text before sending to external LLMs"""

    # Patterns for sensitive data
    SENSITIVE_PATTERNS = [
        # API Keys (various formats)
        (r'\b[A-Za-z0-9]{32,}\b', '[API_KEY_REDACTED]'),  # Generic long alphanumeric
        (r'\b[A-Za-z0-9_-]{20,}\b', '[API_KEY_REDACTED]'),  # API keys with dashes/underscores

        # JWT Tokens
        (r'eyJ[A-Za-z0-9-_]+\.eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*', '[JWT_TOKEN_REDACTED]'),

        # Password patterns
        (r'password["\s]*:[\s]*["\'][^"\']+["\']', 'password: "[PASSWORD_REDACTED]"'),
        (r'PASSWORD["\s]*:[\s]*["\'][^"\']+["\']', 'PASSWORD: "[PASSWORD_REDACTED]"'),

        # Database URLs with credentials
        (r'postgresql://[^:]+:[^@]+@', 'postgresql://[USER]:[PASSWORD]@'),
        (r'mysql://[^:]+:[^@]+@', 'mysql://[USER]:[PASSWORD]@'),
        (r'sqlite://[^:]+:[^@]+@', 'sqlite://[USER]:[PASSWORD]@'),

        # Environment variables that might contain secrets
        (r'\b(API_KEY|SECRET_KEY|ACCESS_TOKEN|AUTH_TOKEN|BEARER_TOKEN)["\s]*=[\s]*["\'][^"\']*["\']',
         r'\1="[REDACTED]"'),

        # Email addresses (to prevent PII leakage)
        (r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', '[EMAIL_REDACTED]'),

        # IP addresses (internal/private)
        (r'\b(10\.|172\.1[6-9]\.|172\.2[0-9]\.|172\.3[0-1]\.|192\.168\.|127\.0\.0\.1)\d{1,3}\.\d{1,3}\b',
         '[INTERNAL_IP_REDACTED]'),

        # Phone numbers
        (r'\b(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b', '[PHONE_REDACTED]'),
    ]

    @classmethod
    def sanitize_text(cls, text: str) -> str:
        """
        Sanitize sensitive data from text content.

        Args:
            text: The text to sanitize

        Returns:
            Sanitized text with sensitive data redacted
        """
        if not text:
            return text

        sanitized = text
        for pattern, replacement in cls.SENSITIVE_PATTERNS:
            sanitized = re.sub(pattern, replacement, sanitized, flags=re.IGNORECASE)

        return sanitized

    @classmethod
    def sanitize_memory_content(cls, content: str) -> str:
        """
        Sanitize memory content specifically, with additional context-aware rules.

        Args:
            content: Memory content to sanitize

        Returns:
            Sanitized memory content
        """
        if not content:
            return content

        # First apply general sanitization
        sanitized = cls.sanitize_text(content)

        # Additional memory-specific patterns
        memory_patterns = [
            # Configuration files content
            (r'(\.env|\.config|config\.json|settings\.json).*?(?=(\n\n|\n#|\Z))',
             '[CONFIG_FILE_CONTENT_REDACTED]'),

            # Database connection strings
            (r'DATABASE_URL.*?=.*?["\'][^"\']*["\']', 'DATABASE_URL="[DATABASE_URL_REDACTED]"'),

            # Supabase keys
            (r'(SUPABASE_.*_KEY).*?=.*?["\'][^"\']*["\']', r'\1="[SUPABASE_KEY_REDACTED]"'),
        ]

        for pattern, replacement in memory_patterns:
            sanitized = re.sub(pattern, replacement, sanitized, flags=re.IGNORECASE | re.DOTALL)

        return sanitized

    @classmethod
    def sanitize_messages(cls, messages: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Sanitize a list of chat messages.

        Args:
            messages: List of message dictionaries with 'content' field

        Returns:
            List of messages with content sanitized
        """
        sanitized_messages = []
        for msg in messages:
            sanitized_msg = msg.copy()
            if 'content' in sanitized_msg:
                sanitized_msg['content'] = cls.sanitize_memory_content(sanitized_msg['content'])
            sanitized_messages.append(sanitized_msg)

        return sanitized_messages

    @classmethod
    def sanitize_memory_export(cls, memory_text: str) -> str:
        """
        Sanitize memory text exported for prompts.

        Args:
            memory_text: Memory text to be included in LLM prompts

        Returns:
            Sanitized memory text safe for external LLM consumption
        """
        return cls.sanitize_memory_content(memory_text)


# Convenience functions for easy importing
def sanitize_text(text: str) -> str:
    """Convenience function to sanitize text"""
    return DataSanitizer.sanitize_text(text)


def sanitize_memory_content(content: str) -> str:
    """Convenience function to sanitize memory content"""
    return DataSanitizer.sanitize_memory_content(content)


def sanitize_messages(messages: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Convenience function to sanitize chat messages"""
    return DataSanitizer.sanitize_messages(messages)


def sanitize_memory_export(memory_text: str) -> str:
    """Convenience function to sanitize memory export for prompts"""
    return DataSanitizer.sanitize_memory_export(memory_text)