# Hotel ERP System

Hotel ERP System is a web-based Enterprise Resource Planning prototype developed for hotel operations management. The system integrates core hotel business processes such as customer management, room management, reservations, service charges, billing, invoice generation, maintenance requests, and role-based access.

This project was developed as part of the Business Process and ERP Systems group assignment.

## Project Overview

The system supports daily hotel operations by connecting different business modules into one integrated platform. It allows hotel staff to manage customers, rooms, reservations, guest services, invoices, and maintenance workflows from a centralized interface.

## Main Modules

### 1. Customer Management
- Add new customers
- View customer records
- Update customer details
- Search customers
- Delete customer records

### 2. Room Management
- View room inventory
- View room status
- Submit room maintenance reports
- Filter rooms by status, type, and floor

### 3. Reservation Management
- Create reservations
- Manage check-in and check-out
- Handle early checkout
- Submit cancellation requests to manager
- Track reservation status

### 4. Service Charge Management
- Add service charges to checked-in reservations
- Support charges such as food, drinks, laundry, and room service
- Calculate service charge totals
- Link service charges to final invoice

### 5. Invoice Management
- Preview interim guest folio
- Generate final invoice after checkout
- Apply advance payment deductions
- Mark invoices as paid
- Select payment method: Cash, Card, or Online Transfer
- Download invoice PDF

### 6. Manager Panel
- View today’s arrivals
- View today’s departures
- View currently in-house guests
- View pending payments
- Approve or reject maintenance requests
- Review reservation cancellation requests
- Decide refund type for cancellations

### 7. Admin Dashboard
- Add app users
- Update user details and roles
- Activate/deactivate users
- Manage room administration
- View recent users
- View role and access overview

## User Roles

The system includes role-based access for:

- `ADMIN`
- `MANAGER`
- `RECEPTIONIST`
- `SERVICE_STAFF`

Each role has different access permissions based on hotel responsibilities.

## Technologies Used

### Backend
- Java
- Spring Boot
- Spring Web
- Spring Data JPA
- Spring Security
- Azure SQL Database / SQL Server
- Maven

### Frontend
- React
- Vite
- Axios
- CSS

### Cloud Deployment
- Azure App Service
- Azure Static Web Apps
- Azure SQL Database
- Azure Storage Services for invoice PDF storage, optional/future improvement

## System Architecture

```text
React Frontend
    |
    | Axios API Requests
    |
Spring Boot Backend
    |
    | JPA / Hibernate
    |
Azure SQL Database
