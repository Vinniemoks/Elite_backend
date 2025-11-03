# Contributing to Elite Events Kenya Backend

Thank you for considering contributing to Elite Events Kenya! This document provides guidelines for contributing to the project.

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on constructive feedback
- Respect differing viewpoints and experiences

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone <your-fork-url>`
3. Create a branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Test your changes
6. Commit with clear messages
7. Push to your fork
8. Open a Pull Request

## Development Setup

See README.md for detailed setup instructions.

## Coding Standards

### JavaScript Style Guide

- Use ES6+ features
- Follow ESLint configuration
- Use Prettier for formatting
- Write clear, self-documenting code
- Add comments for complex logic

### Naming Conventions

- **Files:** camelCase (e.g., `userController.js`)
- **Classes:** PascalCase (e.g., `UserService`)
- **Functions:** camelCase (e.g., `getUserById`)
- **Constants:** UPPER_SNAKE_CASE (e.g., `MAX_FILE_SIZE`)
- **Variables:** camelCase (e.g., `userId`)

### Code Structure

- Keep functions small and focused
- Follow single responsibility principle
- Use async/await over callbacks
- Handle errors properly
- Validate inputs
- Write meaningful error messages

## Commit Messages

Follow conventional commits format:

```
type(scope): subject

body (optional)

footer (optional)
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(auth): add password reset functionality
fix(booking): resolve date validation issue
docs(readme): update installation instructions
```

## Testing

- Write tests for new features
- Ensure existing tests pass
- Aim for >80% code coverage
- Test edge cases and error scenarios

Run tests:
```bash
npm test
npm test -- --coverage
```

## Pull Request Process

1. **Update Documentation:** Update README.md if needed
2. **Add Tests:** Include tests for new features
3. **Run Linter:** Ensure code passes linting
4. **Run Tests:** All tests must pass
5. **Clear Description:** Explain what and why
6. **Link Issues:** Reference related issues

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How was this tested?

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] All tests pass
- [ ] No new warnings
```

## API Development Guidelines

### Endpoint Design

- Use RESTful conventions
- Use proper HTTP methods (GET, POST, PUT, DELETE)
- Use plural nouns for resources
- Use kebab-case for URLs
- Version APIs if needed

### Request/Response

- Validate all inputs
- Return appropriate status codes
- Use consistent response format
- Include error details
- Document all endpoints

### Error Handling

- Use try-catch blocks
- Return meaningful error messages
- Log errors appropriately
- Don't expose sensitive information

## Database Guidelines

### Prisma Schema

- Use descriptive model names
- Add proper indexes
- Define relationships clearly
- Use appropriate data types
- Add comments for complex fields

### Migrations

- Test migrations locally first
- Write reversible migrations
- Document breaking changes
- Keep migrations small and focused

## Security Guidelines

- Never commit secrets or credentials
- Validate and sanitize all inputs
- Use parameterized queries
- Implement rate limiting
- Follow OWASP guidelines
- Keep dependencies updated

## Documentation

- Update API documentation
- Add JSDoc comments for functions
- Document complex algorithms
- Update README for new features
- Include examples where helpful

## Questions?

- Open an issue for discussion
- Ask in pull request comments
- Contact maintainers

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
