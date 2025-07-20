# LiteFi Loan System API Documentation

## Authentication

### User Login
```
POST /api/auth/login
Body: { "email": "user@example.com", "password": "password" }
Response: { "success": true, "token": "jwt_token", "user": {...} }
```

### Admin Login
```
POST /api/auth/admin/login
Body: { "email": "admin@litefi.com", "password": "password" }
Response: { "success": true, "token": "jwt_token", "user": {...} }
```

## Loan Application Endpoints

### Create Loan Application
```
POST /api/loan-applications/{type}
Types: salary-cash, salary-car, business-cash, business-car
Headers: Authorization: Bearer <token>
Body: {
  "loanAmount": 500000,
  "tenure": 12,
  "purpose": "Business expansion",
  "personalInfo": { ... },
  "employmentInfo": { ... },
  "financialInfo": { ... },
  "documents": { ... }
}
```

### Get User Applications
```
GET /api/loan-applications
Headers: Authorization: Bearer <token>
```

## Admin Endpoints

### Get All Applications
```
GET /api/admin/loan-applications?page=1&limit=10&status=PENDING
Headers: Authorization: Bearer <admin_token>
```

### Approve Application
```
POST /api/admin/loan-applications/{id}/approve
Headers: Authorization: Bearer <admin_token>
Body: {
  "approvedAmount": 450000,
  "interestRate": 15.5,
  "approvedTenure": 12,
  "notes": "Approved with standard terms"
}
```

### Reject Application
```
POST /api/admin/loan-applications/{id}/reject
Headers: Authorization: Bearer <admin_token>
Body: {
  "reason": "Insufficient documentation",
  "notes": "Additional documents required"
}
```

### Get Statistics
```
GET /api/admin/statistics
Headers: Authorization: Bearer <admin_token>
Response: {
  "totalApplications": 150,
  "pendingApplications": 25,
  "approvedApplications": 100,
  "rejectedApplications": 25,
  "totalApprovedAmount": 75000000
}
```

## Frontend Integration

### API Helper
```javascript
const apiRequest = async (url, options = {}) => {
  const token = localStorage.getItem('authToken');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers
  };
  
  const response = await fetch(url, { ...options, headers });
  return response.json();
};
```

### Submit Loan Application
```javascript
const submitLoan = async (formData, type) => {
  return apiRequest(`/api/loan-applications/${type}`, {
    method: 'POST',
    body: JSON.stringify(formData)
  });
};
```

### Admin Functions
```javascript
const fetchApplications = async (page = 1, status = null) => {
  const params = new URLSearchParams({ page, limit: '10', ...(status && { status }) });
  return apiRequest(`/api/admin/loan-applications?${params}`);
};

const approveApplication = async (id, data) => {
  return apiRequest(`/api/admin/loan-applications/${id}/approve`, {
    method: 'POST',
    body: JSON.stringify(data)
  });
};

const rejectApplication = async (id, data) => {
  return apiRequest(`/api/admin/loan-applications/${id}/reject`, {
    method: 'POST',
    body: JSON.stringify(data)
  });
};

const fetchStats = async () => {
  return apiRequest('/api/admin/statistics');
};
```

## Loan Types

1. **SALARY_CASH** - Cash loans for salaried employees
2. **SALARY_CAR** - Car loans for salaried employees (includes carInfo)
3. **BUSINESS_CASH** - Cash loans for business owners (includes businessInfo)
4. **BUSINESS_CAR** - Car loans for business owners (includes businessInfo + carInfo)

## Status Values

- **PENDING** - Application submitted, awaiting review
- **APPROVED** - Application approved by admin
- **REJECTED** - Application rejected by admin

## Error Handling

```javascript
const handleError = (response) => {
  if (response.status === 401) {
    // Redirect to login
    window.location.href = '/login';
  } else if (response.status === 403) {
    alert('Access denied');
  } else if (response.errors) {
    response.errors.forEach(err => {
      console.error(`${err.field}: ${err.message}`);
    });
  }
};
```

## Testing

Run the test script:
```bash
node test-loan-system.js
```

This tests all endpoints and functionality.