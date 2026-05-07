---
title: Aura-Sphere API Documentation
version: 1.0.0
---

# Aura-Sphere API Documentation

## Overview

Aura-Sphere Bridge API provides comprehensive endpoints for managing AI-powered planning, security auditing, cost tracking, device profiling, social media integration, and more.

**Base URL:** `http://localhost:8000`

## Authentication

All endpoints require Bearer token authentication via the `Authorization` header:

```
Authorization: Bearer <token>
```

## Endpoints

### Planning Endpoints

#### Create Plan
- **POST** `/api/v1/planning/plans`
- **Description:** Create a new study/project plan
- **Request Body:**
  ```json
  {
    "title": "Learn Python",
    "description": "Complete Python course",
    "user_id": "user123"
  }
  ```
- **Response:** Plan object with id, status, progress

#### Get User Plans
- **GET** `/api/v1/planning/plans/{user_id}`
- **Description:** Retrieve all plans for a user
- **Response:** List of plan objects

#### Create Task
- **POST** `/api/v1/planning/tasks`
- **Request Body:**
  ```json
  {
    "plan_id": 1,
    "title": "Learn basics",
    "priority": 8,
    "due_date": "2024-05-15"
  }
  ```

#### Update Task Progress
- **PATCH** `/api/v1/planning/tasks/{task_id}`
- **Request Body:**
  ```json
  {
    "status": "in_progress",
    "progress": 50
  }
  ```

### Action Queue Endpoints

#### List Pending Actions
- **GET** `/api/v1/actions/pending`
- **Query Params:** `status` (optional: pending, approved, rejected)
- **Response:** List of pending actions requiring user approval

#### Approve Action
- **POST** `/api/v1/actions/{action_id}/approve`
- **Request Body:** `{}`
- **Response:** Approved action confirmation

#### Reject Action
- **POST** `/api/v1/actions/{action_id}/reject`
- **Request Body:**
  ```json
  {
    "reason": "Not appropriate at this time"
  }
  ```

### Social Media Endpoints

#### Instagram Login
- **POST** `/api/v1/social/instagram/login`
- **Request Body:**
  ```json
  {
    "username": "your_username",
    "password": "your_password",
    "verification_code": "123456"
  }
  ```
- **Response:** Account authentication status

#### Sync Instagram Saves
- **GET** `/api/v1/social/instagram/sync`
- **Query Params:** `limit` (default: 50)
- **Response:** List of saved posts

#### List Instagram Collections
- **GET** `/api/v1/social/instagram/collections`

#### Get Instagram Recommendations
- **GET** `/api/v1/social/instagram/recommendations`
- **Query Params:** `theme`, `limit`

### Security Endpoints

#### Run Security Audit
- **POST** `/api/v1/security/audit`
- **Request Body:**
  ```json
  {
    "code": "import os; password = 'secret123'",
    "language": "python",
    "component": "user_script"
  }
  ```
- **Response:** List of security issues with severity levels

#### List Security Issues
- **GET** `/api/v1/security/issues`
- **Query Params:** `status_filter` (open, resolved, ignored)

#### Update Issue Status
- **PATCH** `/api/v1/security/issues/{issue_id}/status`
- **Request Body:**
  ```json
  {
    "status": "resolved"
  }
  ```

### Cost Tracking Endpoints

#### Get Cost Summary
- **GET** `/api/v1/costs/summary`
- **Query Params:** `days` (default: 30)
- **Response:**
  ```json
  {
    "total_cost_usd": 45.67,
    "average_daily_cost": 1.52,
    "by_provider": {...},
    "estimated_monthly_cost": 45.60
  }
  ```

#### Get Cost Trends
- **GET** `/api/v1/costs/trends`
- **Query Params:** `days` (default: 30)
- **Response:** Daily cost breakdown and trend analysis

#### Calculate API Cost
- **POST** `/api/v1/costs/calculate`
- **Request Body:**
  ```json
  {
    "provider": "openai",
    "model": "gpt-4",
    "prompt_tokens": 100,
    "completion_tokens": 50
  }
  ```

#### Log API Usage
- **POST** `/api/v1/costs/log`
- **Request Body:**
  ```json
  {
    "provider": "openai",
    "endpoint": "chat",
    "cost_usd": 0.015,
    "model": "gpt-4",
    "tokens_used": 150
  }
  ```

#### Get Free Alternatives
- **GET** `/api/v1/costs/free-alternatives`
- **Query Params:** `provider`, `endpoint`
- **Response:** List of free alternative services

### Device Endpoints

#### Get Device Profile
- **GET** `/api/v1/device/profile`
- **Response:**
  ```json
  {
    "device_type": "desktop",
    "os": "Linux",
    "storage_total_mb": 500000,
    "ram_total_mb": 16000,
    "health_score": 95
  }
  ```

#### Optimize Device
- **POST** `/api/v1/device/optimize`
- **Response:**
  ```json
  {
    "recommendations": ["Clear cache", "Delete temp files"],
    "estimated_freed_mb": 5000
  }
  ```

#### Get Sync Status
- **GET** `/api/v1/device/sync/status`
- **Response:**
  ```json
  {
    "status": "synced",
    "last_sync": "2024-05-06T10:30:00Z",
    "pending_changes": 0
  }
  ```

## Error Responses

All error responses follow this format:

```json
{
  "detail": "Error message"
}
```

**Common HTTP Status Codes:**
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `404`: Not Found
- `429`: Rate Limited
- `500`: Server Error

## Rate Limiting

API requests are rate-limited. Response headers include:
- `X-RateLimit-Limit`: Maximum requests per minute
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Reset time (Unix timestamp)

## Best Practices

1. **Use pagination** for large result sets
2. **Cache responses** where appropriate
3. **Handle errors gracefully** with exponential backoff
4. **Include relevant filters** to reduce response size
5. **Monitor cost** using the cost tracking endpoints

## Examples

### Planning Workflow
```bash
# Create a plan
curl -X POST http://localhost:8000/api/v1/planning/plans \
  -H "Authorization: Bearer token" \
  -H "Content-Type: application/json" \
  -d '{"title":"Learn APIs","description":"Master REST APIs"}'

# Get all plans
curl http://localhost:8000/api/v1/planning/plans/user123 \
  -H "Authorization: Bearer token"

# Add a task
curl -X POST http://localhost:8000/api/v1/planning/tasks \
  -H "Authorization: Bearer token" \
  -H "Content-Type: application/json" \
  -d '{"plan_id":1,"title":"Read docs","priority":9}'
```

## Support

For issues or questions:
- Check the documentation
- Review error messages
- Enable debug logging
- Contact the development team
