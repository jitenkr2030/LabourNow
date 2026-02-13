# Contributing to LabourNow

Thank you for your interest in contributing to LabourNow! This guide will help you get started with contributing to our on-demand labour booking platform.

## 🤝 How to Contribute

### 🌟 Ways to Contribute

1. **🐛 Report Bugs** - Find and report issues
2. **💡 Suggest Features** - Propose new features and improvements
3. **📝 Improve Documentation** - Help us improve our documentation
4. **🧪 Write Tests** - Add tests to improve code coverage
5. **💻 Code Contributions** - Fix bugs or implement new features
6. **🎨 Design Improvements** - Help improve UI/UX
7. **🌍 Localization** - Help translate the app to other languages

### 🚀 Getting Started

#### Prerequisites

- Node.js 18+ 
- Bun (recommended) or npm/yarn
- Git
- Basic knowledge of TypeScript, React, and Next.js

#### Setup Development Environment

1. **Fork the Repository**
   ```bash
   # Fork the repository on GitHub
   git clone https://github.com/YOUR_USERNAME/LabourNow.git
   cd LabourNow
   ```

2. **Install Dependencies**
   ```bash
   # Using Bun (recommended)
   bun install
   
   # Or using npm
   npm install
   ```

3. **Set Up Environment**
   ```bash
   # Copy environment template
   cp .env.example .env
   
   # Edit .env with your configuration
   ```

4. **Set Up Database**
   ```bash
   # Generate Prisma client
   bun run db:generate
   
   # Push schema to database
   bun run db:push
   
   # Seed database (optional)
   bun run db:seed
   ```

5. **Start Development Server**
   ```bash
   bun run dev
   ```

6. **Verify Setup**
   - Visit [http://localhost:3000](http://localhost:3000)
   - Ensure all pages load correctly
   - Check browser console for errors

## 📋 Development Workflow

### 1. Create an Issue

Before starting work, please create an issue to discuss your proposed changes:

- **Bug Reports**: Use the "Bug" template
- **Feature Requests**: Use the "Feature" template
- **Documentation**: Use the "Documentation" template
- **Other**: Use the "Question" template

### 2. Create a Branch

```bash
# Create a feature branch
git checkout -b feature/your-feature-name

# Or a bug fix branch
git checkout -b fix/your-bug-fix
```

### 3. Make Changes

#### Code Style Guidelines

- **TypeScript**: Use TypeScript for all new code
- **Components**: Use functional components with hooks
- **Styling**: Use Tailwind CSS and shadcn/ui components
- **File Naming**: Use kebab-case for files, PascalCase for components
- **Imports**: Organize imports (React, third-party, local)
- **Comments**: Add JSDoc comments for functions and complex logic

#### Code Example

```typescript
// ✅ Good example
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

/**
 * Worker search component
 * @param props - Component props
 * @param props.onSearch - Callback when search is performed
 * @returns JSX element
 */
export default function WorkerSearch({ onSearch }: WorkerSearchProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSearch = async () => {
    setIsLoading(true)
    try {
      await onSearch(searchTerm)
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Search Workers</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={handleSearch} disabled={isLoading}>
          {isLoading ? 'Searching...' : 'Search'}
        </Button>
      </CardContent>
    </Card>
  )
}
```

### 4. Write Tests

We use Jest and React Testing Library for testing. Please include tests for new features:

```typescript
// __tests__/components/WorkerSearch.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import WorkerSearch from '@/components/WorkerSearch'

describe('WorkerSearch', () => {
  it('renders search input and button', () => {
    const mockOnSearch = jest.fn()
    render(<WorkerSearch onSearch={mockOnSearch} />)
    
    expect(screen.getByPlaceholderText('Search workers...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument()
  })

  it('calls onSearch when search button is clicked', async () => {
    const mockOnSearch = jest.fn()
    render(<WorkerSearch onSearch={mockOnSearch} />)
    
    fireEvent.change(screen.getByPlaceholderText('Search workers...'), {
      target: { value: 'plumber' }
    })
    fireEvent.click(screen.getByRole('button', { name: /search/i }))
    
    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith('plumber')
    })
  })
})
```

### 5. Run Tests

```bash
# Run all tests
bun test

# Run tests in watch mode
bun test:watch

# Run tests with coverage
bun test:coverage

# Run specific test file
bun test WorkerSearch.test.tsx
```

### 6. Commit Changes

Follow our commit message convention:

```bash
# Feature commits
git commit -m "feat: add worker search functionality"

# Bug fix commits
git commit -m "fix: resolve search button not working"

# Documentation commits
git commit -m "docs: update API documentation"

# Style commits
git commit -m "style: format code with prettier"

# Refactor commits
git commit -m "refactor: optimize search performance"

# Test commits
git commit -m "test: add unit tests for worker search"
```

### 7. Create Pull Request

1. **Push Your Branch**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create Pull Request**
   - Go to the GitHub repository
   - Click "New Pull Request"
   - Select your branch
   - Fill out the PR template
   - Request review from maintainers

3. **PR Template**
   ```markdown
   ## Description
   Brief description of changes

   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update

   ## Testing
   - [ ] Unit tests pass
   - [ ] Integration tests pass
   - [ ] Manual testing completed

   ## Checklist
   - [ ] Code follows project style guidelines
   - [ ] Self-review completed
   - [ ] Documentation updated
   - [ ] Tests added/updated
   ```

## 🧪 Testing Guidelines

### Test Structure

```
tests/
├── unit/                    # Unit tests
│   ├── components/          # Component tests
│   ├── hooks/               # Hook tests
│   ├── utils/               # Utility tests
│   └── api/                 # API tests
├── integration/             # Integration tests
│   ├── auth/                # Auth integration
│   ├── bookings/            # Booking integration
│   └── payments/            # Payment integration
├── e2e/                     # End-to-end tests
│   ├── auth-flow/           # Authentication flow
│   ├── booking-flow/        # Booking flow
│   └── payment-flow/        # Payment flow
└── fixtures/                # Test data and mocks
```

### Testing Commands

```bash
# Run all tests
bun test

# Run tests with coverage
bun test:coverage

# Run tests in watch mode
bun test:watch

# Run specific test file
bun test WorkerSearch.test.tsx

# Run tests matching pattern
bun test --testNamePattern="search"

# Generate coverage report
bun test:coverage --coverageReporters=html
```

### Test Best Practices

- **Arrange-Act-Assert**: Structure your tests clearly
- **Descriptive Tests**: Use clear test descriptions
- **Mock Dependencies**: Mock external dependencies
- **Test Edge Cases**: Test error states and edge cases
- **Accessibility**: Test accessibility features
- **Performance**: Test performance-critical code

## 📝 Documentation Guidelines

### Code Documentation

- **JSDoc Comments**: Add JSDoc comments to functions
- **Component Props**: Document component props with TypeScript interfaces
- **API Endpoints**: Document API endpoints with OpenAPI/Swagger
- **README Updates**: Update README for new features

### Example Documentation

```typescript
/**
 * Searches for workers based on criteria
 * @param criteria - Search criteria including category, location, and availability
 * @param options - Additional search options like pagination and sorting
 * @returns Promise<WorkerSearchResult> - Search results with pagination
 * @throws {ValidationError} - When search criteria is invalid
 * @example
 * ```typescript
 * const results = await searchWorkers({
 *   category: 'PLUMBER',
 *   location: 'Mumbai',
 *   availableToday: true
 * })
 * ```
 */
export async function searchWorkers(
  criteria: SearchCriteria,
  options: SearchOptions = {}
): Promise<WorkerSearchResult> {
  // Implementation
}
```

## 🐛 Bug Reporting

### Bug Report Template

```markdown
## Bug Description
Brief description of the bug

## Steps to Reproduce
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

## Expected Behavior
What you expected to happen

## Actual Behavior
What actually happened

## Screenshots
Add screenshots to help explain your problem

## Environment
- OS: [e.g. macOS 13.0]
- Browser: [e.g. Chrome 108]
- Version: [e.g. v1.2.3]

## Additional Context
Add any other context about the problem here
```

## 💡 Feature Requests

### Feature Request Template

```markdown
## Feature Description
Clear and concise description of the feature

## Problem Statement
What problem does this feature solve?

## Proposed Solution
How do you envision this feature working?

## Alternatives Considered
What other approaches did you consider?

## Additional Context
Add any other context, mockups, or screenshots about the feature request here
```

## 🎨 Design Guidelines

### UI/UX Principles

- **Mobile-First**: Design for mobile first, then desktop
- **Accessibility**: Follow WCAG 2.1 guidelines
- **Consistency**: Use existing design system components
- **Performance**: Optimize for fast loading and smooth interactions

### Component Guidelines

- **Reusable Components**: Create reusable, composable components
- **Props Interface**: Define clear TypeScript interfaces for props
- **Default States**: Handle loading, error, and empty states
- **Responsive Design**: Ensure components work on all screen sizes

## 🚀 Deployment Guidelines

### Pre-deployment Checklist

- [ ] All tests pass
- [ ] Code is properly formatted
- [ ] Documentation is updated
- [ ] Environment variables are configured
- [ ] Database migrations are run
- [ ] Build completes successfully

### Deployment Process

1. **Test Environment**: Deploy to staging first
2. **Smoke Tests**: Run smoke tests on staging
3. **Production Deployment**: Deploy to production
4. **Post-deployment**: Verify functionality in production

## 🤝 Community Guidelines

### Code of Conduct

- **Be Respectful**: Treat everyone with respect and kindness
- **Be Inclusive**: Welcome contributions from everyone
- **Be Constructive**: Provide helpful, constructive feedback
- **Be Patient**: Help newcomers learn and grow

### Getting Help

- **GitHub Issues**: Use GitHub issues for questions and problems
- **Discord/Slack**: Join our community chat (link in README)
- **Email**: Contact us at support@labournow.in

## 🏆 Recognition

### Contributors

We recognize and appreciate all contributions to LabourNow:

- **🌟 Featured Contributors**: Highlighted in our README
- **🎉 Release Notes**: Mentioned in release notes
- **🏆 Hall of Fame**: Added to our contributor hall of fame
- **👕 Swag**: Receive LabourNow swag for significant contributions

### Types of Contributions

- **💻 Code**: Bug fixes, features, performance improvements
- **📝 Documentation**: README, API docs, tutorials
- **🎨 Design**: UI/UX improvements, graphics, branding
- **🧪 Testing**: Unit tests, integration tests, E2E tests
- **🌍 Localization**: Translations, cultural adaptations
- **🐛 Bug Reports**: Finding and reporting issues
- **💡 Ideas**: Feature suggestions, improvements
- **📢 Promotion**: Spreading the word about LabourNow

## 📞 Get Help

If you need help with contributing:

- **📧 Email**: dev@labournow.in
- **💬 Discord**: [Join our Discord](https://discord.gg/labournow)
- **🐛 Issues**: [Create an issue](https://github.com/jitenkr2030/LabourNow/issues)
- **📖 Documentation**: [Check our docs](https://docs.labournow.in)

---

Thank you for contributing to LabourNow! Your contributions help us build a better platform for India's hardworking labour community. 🚀🇮🇳