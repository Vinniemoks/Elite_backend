# Security Policy

## Supported Versions

Currently supported versions with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security issue, please follow these steps:

### 1. Do Not Publicly Disclose

Please do not create a public GitHub issue for security vulnerabilities.

### 2. Report Privately

Send details to: security@eliteeventskenya.com

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### 3. Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Fix Timeline**: Depends on severity
  - Critical: 1-3 days
  - High: 7-14 days
  - Medium: 14-30 days
  - Low: 30-90 days

### 4. Disclosure Policy

- We will acknowledge your report within 48 hours
- We will provide regular updates on our progress
- We will notify you when the vulnerability is fixed
- We will credit you in our security advisories (unless you prefer to remain anonymous)

## Security Measures

### Authentication & Authorization
- JWT-based authentication
- Bcrypt password hashing (10 rounds minimum)
- Role-based access control (RBAC)
- Token expiration and refresh mechanism
- Email verification required

### API Security
- Rate limiting on all endpoints
- CORS configuration
- Helmet security headers
- Input validation and sanitization
- SQL injection prevention (Prisma ORM)
- XSS protection
- CSRF protection

### Data Protection
- Encrypted database connections
- Secure environment variable management
- No sensitive data in logs
- Regular security audits
- Automated dependency updates

### Infrastructure
- HTTPS only in production
- Secure cookie settings
- Regular backups
- Monitoring and alerting
- DDoS protection

## Best Practices for Contributors

1. **Never commit secrets**
   - Use environment variables
   - Add sensitive files to .gitignore
   - Use git-secrets or similar tools

2. **Validate all inputs**
   - Use express-validator
   - Sanitize user inputs
   - Validate file uploads

3. **Follow secure coding practices**
   - Use parameterized queries
   - Avoid eval() and similar functions
   - Keep dependencies updated
   - Review code for security issues

4. **Test security features**
   - Write security-focused tests
   - Test authentication flows
   - Test authorization checks
   - Test input validation

## Security Checklist

- [ ] All endpoints have authentication where required
- [ ] All inputs are validated and sanitized
- [ ] Passwords are properly hashed
- [ ] Sensitive data is not logged
- [ ] Rate limiting is configured
- [ ] CORS is properly configured
- [ ] Security headers are set
- [ ] Dependencies are up to date
- [ ] Environment variables are secured
- [ ] Database connections are encrypted

## Contact

For security concerns: security@eliteeventskenya.com

For general inquiries: support@eliteeventskenya.com
