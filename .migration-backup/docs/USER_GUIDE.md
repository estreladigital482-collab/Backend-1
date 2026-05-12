# Aura-Sphere User Guide

## Table of Contents
1. [Getting Started](#getting-started)
2. [Planning & Task Management](#planning--task-management)
3. [Security Auditing](#security-auditing)
4. [Cost Tracking](#cost-tracking)
5. [Theme Customization](#theme-customization)
6. [Social Media Integration](#social-media-integration)
7. [Device Management](#device-management)
8. [Troubleshooting](#troubleshooting)

## Getting Started

### System Requirements
- **OS:** Linux, macOS, or Windows with WSL2
- **RAM:** Minimum 4GB
- **Storage:** 2GB free space
- **Browser:** Chrome, Firefox, Safari, or Edge (latest versions)

### First Login
1. Visit `http://localhost:3000` (development) or your deployment URL
2. Sign up with email or social account
3. Complete identity profile setup
4. Choose your visual theme
5. Create your first plan

## Planning & Task Management

### Creating a Plan

**What are Plans?**
Plans are structured collections for your goals. You can organize them by area of life (Study, Work, Health) or by project.

**How to Create:**
1. Click **"New Plan"** button in the Planning tab
2. Enter plan title and description
3. Choose a category (optional)
4. Click **"Create Plan"**

### Managing Tasks

**Adding Tasks to a Plan:**
1. Open a plan
2. Click **"Add Task"** 
3. Enter task details:
   - **Title:** What you need to do
   - **Description:** Details (optional)
   - **Priority:** 1-10 scale (1=low, 10=urgent)
   - **Due Date:** When it's needed
4. Click **"Add Task"**

**Task Status Workflow:**
- **Not Started** → Initial state
- **In Progress** → You're working on it
- **Completed** → Task finished
- **On Hold** → Paused temporarily

**Track Progress:**
- Use the progress slider (0-100%)
- Add notes as you work
- View completion timeline

### AI-Powered Insights
The AI assistant analyzes your plans to suggest:
- Task order optimization
- Time estimates
- Resource recommendations
- Potential bottlenecks

## Security Auditing

### What is Security Auditing?

The Security Auditor scans your code for common vulnerabilities:
- **Code Injection** - Untrusted input execution
- **SQL Injection** - Database query attacks
- **Hardcoded Secrets** - Exposed API keys/passwords
- **Unsafe Deserialization** - Dangerous object creation
- **Resource Exhaustion** - Memory/CPU limits bypassed
- **Path Traversal** - Unauthorized file access
- **XXE Attacks** - XML external entity vulnerabilities
- **Weak Cryptography** - Insecure encryption methods

### Running an Audit

1. Go to **Security Dashboard**
2. Paste your code in the code editor
3. Select the programming language
4. Select component name (e.g., "user_auth", "payment_handler")
5. Click **"Run Audit"**

### Understanding Results

**Issue Severity:**
- 🔴 **Critical** - Security breach risk
- 🟠 **High** - Serious vulnerability
- 🟡 **Medium** - Should be fixed
- 🟢 **Low** - Minor concerns

**For Each Issue:**
- Vulnerability type
- Location in code
- Risk explanation
- Suggested fix
- OWASP reference

### Taking Action

1. **Review** the suggested fix
2. **Implement** changes in your code
3. **Re-audit** to verify the fix
4. **Mark as Resolved** when complete

### Best Practices

- Audit code **before pushing** to production
- Fix **Critical issues immediately**
- Keep dependencies updated
- Use **environment variables** for secrets
- Enable **input validation** everywhere

## Cost Tracking

### Why Track API Costs?

Many AI and cloud services charge per API call. The Cost Tracker helps you:
- Monitor spending patterns
- Identify expensive operations
- Find cost-effective alternatives
- Estimate monthly bills
- Set budget alerts

### Using the Cost Tracker

**View Your Costs:**
1. Go to **Cost Tracker** tab
2. Select time period (7/30/90 days)
3. See breakdown by provider

**Cost Summary Shows:**
- **Total Cost** for selected period
- **Daily Average** spent
- **By Provider** breakdown (OpenAI, Anthropic, etc.)
- **Cost Trend** (increasing/stable/decreasing)

### Understanding Your Costs

**What's Included:**
- API calls via bridge
- Token usage (for LLM providers)
- Rate-limited operations
- Successful and failed requests

**What's Not Included:**
- Storage costs
- Authentication services
- Infrastructure (unless tracked separately)

### Finding Free Alternatives

1. In **Cost Tracker**, click **"Free Alternatives"**
2. Select your provider (e.g., "OpenAI")
3. Browse free services for similar functionality:
   - **Ollama** - Local open-source LLM
   - **LM Studio** - Professional LLM platform
   - **GPT4All** - Easy-to-use local models
   - **Hugging Face** - Open model registry

### Cost Optimization Tips

1. **Batch Requests** - Combine multiple calls into one
2. **Cache Results** - Store and reuse responses
3. **Use Free Tier** - Many providers offer free quotas
4. **Monitor Trends** - Catch runaway costs early
5. **Set Alerts** - Get notified at spending thresholds

## Theme Customization

### Available Themes

**Preset Themes:**
- **Dark** - Easy on the eyes, night-friendly
- **Ocean** - Cool blues and teals
- **Forest** - Natural greens and browns
- **Fire** - Warm reds and oranges
- **Sunset** - Purple and pink gradients

### Applying a Preset Theme

1. Go to **Themes** tab
2. Select **Theme Gallery**
3. Click on any preset theme
4. Theme applies immediately

### Creating Custom Themes

**Theme Builder:**
1. Go to **Themes** tab → **Theme Builder**
2. Click color picker for each element:
   - **Primary** - Main accent color
   - **Secondary** - Supporting color
   - **Success** - Success state (green)
   - **Error** - Error state (red)
   - **Background** - Main background
3. Choose layout comfort:
   - **Compact** - Minimal spacing
   - **Comfortable** - Standard spacing
   - **Spacious** - Maximum breathing room
4. Click **Save Theme**
5. Your theme is stored and synced

### Theme Storage

- Themes sync across your devices
- Custom themes stored in cloud
- Can export/share themes with others

## Social Media Integration

### Instagram Connection

**Setup:**
1. Go to **Integrations** tab
2. Click **Connect Instagram**
3. Enter Instagram username and password
4. Complete 2FA if enabled
5. Grant permissions

**What Gets Synced:**
- Saved posts (collections)
- Liked posts
- Followed accounts
- Story highlights

### Using Instagram Collections

1. Go to **Instagram Collections**
2. Browse your saved posts
3. Use collections for:
   - **Research** - Save design inspiration
   - **Learning** - Collect tutorials
   - **Reference** - Gather examples

### Getting Recommendations

1. Click **Get Recommendations**
2. Select theme/interest
3. Set how many posts (limit)
4. Browse personalized suggestions
5. Save posts to collections

## Device Management

### Device Profile

View your device information:
- Operating system and version
- Free vs. total storage/RAM
- Device health score
- Last sync time

### Device Optimization

**View Recommendations:**
1. Go to **Device** tab
2. Click **Optimize**
3. See suggested actions:
   - Clear cache
   - Delete old logs
   - Remove temporary files
   - Archive old data

**What Gets Optimized:**
- Application cache (does NOT clear session data)
- Temporary files
- Old backups
- Unused data

### Sync Status

**Status Indicators:**
- ✅ **Synced** - All up to date
- ⏳ **Syncing** - In progress
- ⚠️ **Pending** - Changes waiting to sync
- ❌ **Error** - Sync failed

**If Sync Fails:**
1. Check internet connection
2. Click **Retry Sync**
3. Contact support if problem persists

## Troubleshooting

### Common Issues

**Q: Can't log in**
A: 
- Clear browser cache
- Reset password
- Check email for verification link
- Try different browser

**Q: Cost estimates seem wrong**
A:
- Ensure all integrations are connected
- Check date range filter
- Verify API keys are current
- Free tier calls may not show until synced

**Q: Security audit not finding issues**
A:
- Paste complete code (not snippets)
- Select correct language
- Check component naming
- Try specific risky patterns

**Q: Theme not saving**
A:
- Ensure browser allows localStorage
- Check you're logged in
- Try different theme first
- Refresh page

**Q: Instagram sync fails**
A:
- Re-enter Instagram credentials
- Disable 2FA temporarily (test only)
- Check Instagram hasn't changed API
- Ensure account isn't restricted

### Getting Help

1. **Check Documentation** - Most answers here
2. **Search Knowledge Base** - Click help icon
3. **Community Forum** - Ask other users
4. **Support Email** - security@aura-sphere.com

### Reporting Bugs

Send to `bugs@aura-sphere.com` with:
1. Browser and OS version
2. Steps to reproduce
3. Expected vs actual behavior
4. Screenshots if relevant
5. Any error messages

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + K` | Open search |
| `Ctrl/Cmd + N` | New plan |
| `Ctrl/Cmd + S` | Save current work |
| `Esc` | Close modals |
| `Alt + 1-9` | Switch tabs |

## Performance Tips

1. **Browser:** Keep extensions minimal
2. **Network:** Use stable connection
3. **Cache:** Clear browser cache monthly
4. **Updates:** Keep app updated
5. **Local:** Max 1000 tasks per plan

## Privacy & Security

- Your data is encrypted in transit and at rest
- Credentials never stored in plain text
- Regular security audits performed
- GDPR/CCPA compliant
- You can request data export/deletion

## Getting Started Next Steps

1. ✅ Create your first plan
2. ✅ Add 3-5 tasks
3. ✅ Run a security audit (if coding)
4. ✅ Check your API costs
5. ✅ Customize your theme
6. ✅ Connect Instagram (optional)
7. ✅ Explore advanced features

Enjoy using Aura-Sphere!
