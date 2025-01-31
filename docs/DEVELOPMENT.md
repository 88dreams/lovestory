# Development Guide

## Table of Contents
1. [Shell Environment](#shell-environment)
2. [Environment Configurations](#environment-configurations)
3. [Build Configuration](#build-configuration)

## Shell Environment

### PowerShell Configuration
- Primary shell: PowerShell
- Location: `C:\Program Files\PowerShell\7\pwsh.exe`

### PowerShell Command Conventions
- Do not use pipe to `cat` (this is a bash convention)
- Use PowerShell native commands where possible
- For Git commands, use standard Git syntax (PowerShell handles these correctly)

### Common Command Translations
Bash -> PowerShell:
- `ls` -> `Get-ChildItem` (or `ls` works as an alias)
- `cat` -> `Get-Content`
- `echo` -> `Write-Output` (or `echo` works as an alias)
- `mkdir` -> `New-Item -ItemType Directory`
- `rm` -> `Remove-Item`
- `cp` -> `Copy-Item`
- `mv` -> `Move-Item`

### Git Commands in PowerShell
Git commands work the same in PowerShell as in other shells:
```powershell
git status
git add .
git commit -m "message"
git push
git pull
```

### PowerShell Environment Notes
- PowerShell is case-insensitive by default
- Use backslashes (\) for file paths, or forward slashes (/) work too
- Remember to handle spaces in paths with quotes
- PowerShell has different output formatting than bash

## Environment Configurations

### Development Environment

#### Authentication
```typescript
// mobile/lovestory-mobile/src/services/auth/socialAuth.ts
const GOOGLE_WEB_CLIENT_ID = 'YOUR_GOOGLE_WEB_CLIENT_ID';
```

#### API Endpoints
```typescript
// mobile/lovestory-mobile/src/services/api/config.ts
export const API_BASE_URL = 'http://localhost:8000';
```

#### Bundle Identifiers
```json
// mobile/lovestory-mobile/app.json
{
  "ios": {
    "bundleIdentifier": "com.yourdomain.lovestory"
  },
  "android": {
    "package": "com.yourdomain.lovestory"
  }
}
```

### Staging Environment

#### Authentication
```typescript
// mobile/lovestory-mobile/src/services/auth/socialAuth.ts
const GOOGLE_WEB_CLIENT_ID = 'STAGING_GOOGLE_WEB_CLIENT_ID';
```

#### API Endpoints
```typescript
// mobile/lovestory-mobile/src/services/api/config.ts
export const API_BASE_URL = 'https://staging-api.lovestory.com';
```

#### Bundle Identifiers
```json
// mobile/lovestory-mobile/app.json
{
  "ios": {
    "bundleIdentifier": "com.yourdomain.lovestory.staging"
  },
  "android": {
    "package": "com.yourdomain.lovestory.staging"
  }
}
```

### Production Environment

#### Authentication
```typescript
// mobile/lovestory-mobile/src/services/auth/socialAuth.ts
const GOOGLE_WEB_CLIENT_ID = 'PRODUCTION_GOOGLE_WEB_CLIENT_ID';
```

#### API Endpoints
```typescript
// mobile/lovestory-mobile/src/services/api/config.ts
export const API_BASE_URL = 'https://api.lovestory.com';
```

#### Bundle Identifiers
```json
// mobile/lovestory-mobile/app.json
{
  "ios": {
    "bundleIdentifier": "com.yourdomain.lovestory"
  },
  "android": {
    "package": "com.yourdomain.lovestory"
  }
}
```

## Environment Variables

### File Structure
Create the following files in `mobile/lovestory-mobile/` (do not commit to repository):

#### `.env.development`
```bash
API_URL=http://localhost:8000
GOOGLE_WEB_CLIENT_ID=development_client_id
```

#### `.env.staging`
```bash
API_URL=https://staging-api.lovestory.com
GOOGLE_WEB_CLIENT_ID=staging_client_id
```

#### `.env.production`
```bash
API_URL=https://api.lovestory.com
GOOGLE_WEB_CLIENT_ID=production_client_id
```

## Build Configuration

### Git Configuration
Add to `mobile/lovestory-mobile/.gitignore`:
```gitignore
# Environment files
.env.*
google-services.json
GoogleService-Info.plist
```

### Build Scripts
```json
// mobile/lovestory-mobile/package.json scripts
{
  "scripts": {
    "start:dev": "ENVFILE=.env.development expo start",
    "start:staging": "ENVFILE=.env.staging expo start",
    "start:prod": "ENVFILE=.env.production expo start",
    "build:android:staging": "ENVFILE=.env.staging eas build -p android --profile staging",
    "build:android:prod": "ENVFILE=.env.production eas build -p android --profile production",
    "build:ios:staging": "ENVFILE=.env.staging eas build -p ios --profile staging",
    "build:ios:prod": "ENVFILE=.env.production eas build -p ios --profile production"
  }
}
```

## Setup Checklist
- [ ] Create API configuration file
- [ ] Set up environment variable handling
- [ ] Configure build scripts
- [ ] Create environment-specific Google configurations
- [ ] Set up Apple Sign-In for each environment

Last Updated: January 31, 2025

Note: Keep this file updated as new configuration requirements are added. Do not store actual production values in this file. 