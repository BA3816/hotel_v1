# JWT Secret Guide

## What is JWT_SECRET?

JWT_SECRET is a secret key used to **sign and verify** JSON Web Tokens (JWT) that are used for authentication. When a user logs in, the server creates a JWT token signed with this secret. When the user makes authenticated requests, the server verifies the token using the same secret.

## Why is it Important?

- 🔐 **Security**: If someone knows your JWT_SECRET, they can forge authentication tokens
- 🚫 **Access Control**: Protects your admin panel and API endpoints
- ⚠️ **Production**: Using a weak or default secret is a major security risk

## How to Generate a Secure JWT Secret

### Method 1: Use the Script (Easiest)

```bash
cd backend
npm run generate-secret
```

This will output a secure random secret. Copy it and paste it into your `.env` file.

### Method 2: Generate Manually

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

### Method 3: Online Generator

You can use an online random string generator, but make sure it's at least 32 characters long and contains a mix of letters, numbers, and special characters.

## Setting Up JWT_SECRET

1. **Copy the example file:**
   ```bash
   cp env.example .env
   ```

2. **Generate a secret:**
   ```bash
   npm run generate-secret
   ```

3. **Add to `.env` file:**
   ```env
   JWT_SECRET=your_generated_secret_here
   ```

4. **Never commit `.env` to git!** It should already be in `.gitignore`

## For Development vs Production

### Development
- You can use a simple secret for local development
- Example: `JWT_SECRET=dev_secret_key_123`

### Production
- **MUST** use a strong, randomly generated secret
- Should be at least 32 characters long
- Use `npm run generate-secret` to create one
- Store it securely and never share it

## What Happens If You Don't Set It?

If JWT_SECRET is not set, the server will use a default fallback value (`'your_secret_key'`), which is **NOT SECURE** for production.

## Example

```env
# .env file
JWT_SECRET=K8j3mP9xL2nQ5vR7wT1yU4zA6bC8dE0fG2hI4jK6lM8nO0pQ2rS4tU6vW8xY0zA2bC4dE6fG8h
```

This is a securely generated secret (64 characters, base64 encoded).

## Security Best Practices

1. ✅ Generate a unique secret for each environment (dev, staging, production)
2. ✅ Never commit secrets to version control
3. ✅ Use environment variables, not hardcoded values
4. ✅ Rotate secrets periodically in production
5. ✅ Use different secrets for different applications

## Troubleshooting

**Problem:** "Invalid token" errors
- Check that JWT_SECRET is set in your `.env` file
- Restart the server after changing `.env`
- Make sure there are no extra spaces or quotes around the secret

**Problem:** "Token expired"
- This is normal - tokens expire after 24 hours
- User needs to log in again

