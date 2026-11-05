# PennyPilot — Project Requirements

**Version:** 1.0  
**Project type:** Full-stack web application  
**Currency:** Kenyan Shilling (KES)

## 1. Project Overview

PennyPilot is a personal finance management platform that helps individuals monitor their income, expenses, budgets and financial habits.

The application provides a centralised dashboard where users can record financial transactions, organise spending categories and understand their financial position.

## 2. Problem Statement

Many individuals struggle to maintain a clear picture of their finances because their income and expenses are not consistently recorded or organised.

PennyPilot aims to provide a simple, secure and accessible solution for managing personal finances.

## 3. Target Users

- University students.
- Young professionals.
- Individuals managing personal budgets.
- Anyone interested in tracking their spending habits.

## 4. Core Functional Requirements

### User Management
- Register using an email address and password.
- Log in and log out securely.
- Manage basic profile information.
- Support future OAuth authentication.

### Transaction Management
- Record income and expenses.
- Edit existing transactions.
- Delete transactions.
- Assign categories.
- Record transaction dates and descriptions.
- View transaction history.

### Financial Dashboard
- Display total income.
- Display total expenses.
- Calculate available balance.
- Show monthly financial summaries.
- Visualise spending categories.

### Budget Management
- Create monthly budgets.
- Assign budgets to spending categories.
- Track spending against budgets.
- Display budget progress.

## 5. Non-Functional Requirements

### Security
- Secure password hashing.
- Secure authentication sessions.
- Server-side input validation.
- User-specific data access restrictions.
- HTTPS in production.
- Protection against common web vulnerabilities.

### Performance
- Efficient database queries.
- Responsive user interface.
- Reasonable API response times.

### Availability
- Cloud-hosted application.
- Database backup strategy.
- Application health monitoring.

### Usability
- Responsive design for desktop and mobile.
- Simple navigation.
- Clear financial summaries.

## 6. Technology Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS.
- Backend: Node.js, Express, TypeScript.
- Database: PostgreSQL.
- ORM: Prisma.
- Validation: Zod.
- Testing: Vitest and Supertest.
- Infrastructure: Docker and AWS.
- Version control: Git and GitHub.

## 7. Financial Rules

- All transactions use KES.
- Monetary amounts use two decimal places.
- Income and expenses are recorded separately.
- Available balance = total income - total expenses.
- Budgets are tracked against qualifying expenses.
- No real bank account connections in the initial release.

## 8. Security and Privacy

- Each user can access only their own financial records.
- Passwords must never be stored in plain text.
- Sensitive configuration must not be committed to Git.
- Financial data must be transmitted over HTTPS in production.

## 9. Future Enhancements

- Google OAuth authentication.
- CSV financial report exports.
- Advanced spending analytics.
- Improved financial insights.
- Optional mobile application.
- Possible M-Pesa integration after the MVP.

## 10. Project Success Criteria

PennyPilot will be considered successful when:

1. Users can register and authenticate.
2. Users can securely manage their transactions.
3. Financial summaries are calculated correctly.
4. Users can create and monitor budgets.
5. The application passes its essential tests.
6. The application is deployed to cloud infrastructure.
7. The project has clear technical documentation.
