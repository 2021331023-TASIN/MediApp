# MediAlert (MediTrack) Project Specification

## 1. Project Overview
A smart medicine reminder and health assistant web application for users to manage medication routines, receive reminders, track medicine intake, and access medicine/doctor information.

---

## 2. Technology Stack

### Frontend
- HTML
- CSS
- JavaScript
- React.js

### Backend
- Node.js
- Express.js
- MySQL

---

## 3. Core Features (MVP)

- User authentication (sign up, login)
- Add/update/delete prescribed medicines
- Set reminders for medicine intake
- Notifications for scheduled doses
- Mark medicine as 'taken' and track history
- Dashboard for medicine intake history (daily/weekly/monthly)
- Search for medicine details/side effects
- Search for doctors and view contact info

---

## 4. User Flow

1. **Sign Up/Login**
2. **Add Medicine** (name, dosage, schedule)
3. **Receive Notifications** (reminders to take medicine)
4. **Mark Medicine as Taken**
5. **View Dashboard** (track intake history)
6. **Search Medicine Info/Doctors**

---

## 5. Basic Wireframes/Pages

- Login/Register Page
- Dashboard Page
- Add/Edit Medicine Page
- Medicine History Page
- Search Page (medicine & doctor)
- Notification Modal/Component

---

## 6. Database Design (MySQL Example)

- **Users Table**: id, name, email, password_hash
- **Medicines Table**: id, user_id, name, dosage, schedule, start_date, end_date
- **IntakeHistory Table**: id, user_id, medicine_id, date, status (taken/not taken)
- **Doctors Table**: id, name, specialty, contact_info

---

## 7. API Endpoints (Express.js Example)

- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `POST /api/medicines` - Add medicine
- `GET /api/medicines` - List medicines
- `PUT /api/medicines/:id` - Update medicine
- `DELETE /api/medicines/:id` - Delete medicine
- `POST /api/intake` - Mark medicine as taken
- `GET /api/history` - Get intake history
- `GET /api/medicine-info` - Search medicine info
- `GET /api/doctors` - Search doctors

---

## 8. Next Steps

- Set up code repositories (frontend and backend)
- Initialize projects with basic scaffolding
- Start building authentication system
- Design database schema and connect backend to MySQL
- Begin implementing medicine CRUD and dashboard features

---

## 9. References and Notes

- Use OpenFDA API or similar for medicine info
- Consider Twilio/Firebase for notifications in future
