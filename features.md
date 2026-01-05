# Features and Workflows

This document describes the core features, their purpose, user workflow, and the technical implementation details for the Visit Bangladesh platform.

## 0. Core Platform Systems

### 0.1 Notifications (All Roles)
Purpose
- Keep users informed about important actions and updates.

Workflow
- Users receive notifications for: new followers, new reviews, booking/registration updates, guide application status, admin announcements, and chat messages.
- Notifications can be opened from the bell icon in the navbar.

Technical details
- API: `GET /api/notifications`
- Mark read: `PATCH /api/notifications/:id/read`
- Mark all read: `PATCH /api/notifications/read-all`
- UI: `frontend/src/components/Navbar.jsx`

### 0.2 Event-based Chat (Guide ↔ Client)
Purpose
- Enable direct communication between event guides and registered clients.

Workflow
- Chat is created per event after a client registers.
- Only the event creator (guide) and registered clients can participate.
- Messages are scoped to each event.

Technical details
- API: `GET /api/chats/threads`, `GET /api/chats/threads/:threadId/messages`, `POST /api/chats/threads/:threadId/messages`
- Models: `backend/src/models/ChatThread.js`, `backend/src/models/ChatMessage.js`
- UI: `frontend/src/components/chat/ChatPanel.jsx`, `frontend/src/components/Navbar.jsx`

## 1. Authentication and Accounts

### 1.1 Secure Login/Signup (JWT)
Purpose
- Authenticate users securely and maintain sessions.

Workflow
- Users register or log in.
- JWT is stored on the client and attached to requests.

Technical details
- API: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- Client token handling: `frontend/src/services/api/base.js`, `frontend/src/context/AuthContext.jsx`

### 1.2 Profile and Settings
Purpose
- Allow users to manage personal information and preferences.

Workflow
- Users view and update profile details (name, bio, avatar, contact info).

Technical details
- API: `GET /api/users/me`, `PUT /api/users/me`, `PUT /api/users/me/password`
- UI: `frontend/src/pages/ProfilePage.jsx`

### 1.3 Personalized Dashboard (All Users)
Purpose
- Centralize key user data for quick access.

Workflow
- Users access dashboard sections: reviews, bookmarks, registrations, followed guides.

Technical details
- API: `GET /api/users/me/bookmarks`, `GET /api/users/me/reviews`, `GET /api/users/me/registrations`
- UI: `frontend/src/pages/ProfilePage.jsx` and dashboard components in `frontend/src/components/dashboard`

## 2. Tourist Spot Exploration

### 2.1 Browse Tourist Spots
Purpose
- Help users discover destinations.

Workflow
- Users browse a grid of available spots.

Technical details
- API: `GET /api/spots`
- UI: `frontend/src/pages/SpotsPage.jsx`

### 2.2 Map-based Spot Details
Purpose
- Provide location-centric view of tourist spots.

Workflow
- Users view details including images, description, activities, location, and rating.

Technical details
- API: `GET /api/spots/:id`
- UI: `frontend/src/pages/SpotDetailPage.jsx`

### 2.3 Search and Filter Spots
Purpose
- Let users find spots by category, location, or rating.

Workflow
- Apply category, location, and rating filters.

Technical details
- API supports query params on `GET /api/spots`
- UI: `frontend/src/pages/SpotsPage.jsx`

### 2.4 Bookmarking
Purpose
- Save spots and events for later.

Workflow
- Users can bookmark/unbookmark tourist spots and events.

Technical details
- Spots: `POST /api/users/me/bookmarks/spots/:spotId`, `DELETE /api/users/me/bookmarks/spots/:spotId`
- Events: `POST /api/events/:id/bookmark`
- UI: `frontend/src/pages/ProfilePage.jsx`, `frontend/src/components/dashboard/BookmarksSection.jsx`

## 3. Events and Bookings

### 3.1 Event Registration (Client)
Purpose
- Allow users to register for events and submit required details.

Workflow
- Client fills out registration form and submits.
- Registration creates an event-scoped chat with the guide.

Technical details
- API: `POST /api/events/:id/register`
- UI: `frontend/src/pages/EventDetailPage.jsx`
- Model: `backend/src/models/EventRegistration.js`

### 3.2 Weather Search
Purpose
- Show weather details for selected locations.

Workflow
- User searches weather by place/city/district.

Technical details
- API: `GET /api/weather/suggest`, `GET /api/weather/current`
- UI: `frontend/src/pages/WeatherPage.jsx`

## 4. Reviews, Ratings, Blogs, and Social

### 4.1 Reviews (Spots + Guides)
Purpose
- Collect user feedback and ratings.

Workflow
- Users create, edit, and delete reviews with 1–5 star ratings.

Technical details
- Spots: `POST /api/spots/:id/reviews`, `PUT /api/spots/:id/reviews/:reviewId`, `DELETE /api/spots/:id/reviews/:reviewId`
- Guides: `POST /api/guides/:id/reviews`, `PUT /api/guides/:id/reviews/:reviewId`, `DELETE /api/guides/:id/reviews/:reviewId`

### 4.2 Blogs (User Posts)
Purpose
- Allow users to share travel stories.

Workflow
- Users create, edit, and delete blog posts.

Technical details
- API: `POST /api/blogs`, `PUT /api/blogs/:id`, `DELETE /api/blogs/:id`
- UI: `frontend/src/pages/BlogCreatePage.jsx`, `frontend/src/pages/BlogEditPage.jsx`

### 4.3 Blog Interactions
Purpose
- Enable engagement on user posts.

Workflow
- Users like and comment on blogs.

Technical details
- API: `POST /api/blogs/:id/like`, `POST /api/blogs/:id/unlike`, `POST /api/blogs/:id/comment`, `DELETE /api/blogs/:id/comment/:commentId`
- UI: `frontend/src/pages/BlogDetailPage.jsx`

### 4.4 Follow Guides
Purpose
- Subscribe to guide updates and new tours.

Workflow
- Users follow/unfollow guides; notifications are triggered for new guide events.

Technical details
- API: `POST /api/guides/:id/follow`, `DELETE /api/guides/:id/follow`
- UI: `frontend/src/pages/GuideProfilePage.jsx`, `frontend/src/pages/ProfilePage.jsx`

## 5. Guide Management and Tours

### 5.1 Create/Publish Tours (Guide)
Purpose
- Enable guides to create and publish event tours.

Workflow
- Guides submit event details (itinerary, price, dates, description).

Technical details
- API: `POST /api/events`
- UI: `frontend/src/pages/EventWizardPage.jsx`

### 5.2 Manage Tours (Guide)
Purpose
- Allow guides to manage events and view registrations.

Workflow
- Guides see all registrations per event and can manage event status.

Technical details
- API: `GET /api/events/me/registrations`, `PUT /api/events/:id`
- UI: `frontend/src/components/dashboard/RegisteredSection.jsx`

### 5.3 Apply for Guide Role (User → Guide)
Purpose
- Let regular users apply to become verified guides.

Workflow
- User submits application with required info and documents.

Technical details
- API: `POST /api/guide-applications`, `GET /api/guide-applications/me`
- UI: `frontend/src/pages/ApplyForGuidePage.jsx`

## 6. Admin Dashboard and Role Control

### 6.1 Manage Users and Guides (Admin)
Purpose
- Allow admins to view and manage platform users.

Workflow
- Admin reviews users, promotes or demotes roles, and suspends accounts.

Technical details
- UI: `frontend/src/pages/AdminDashboardPage.jsx`

### 6.2 Guide Application Verification (Admin)
Purpose
- Approve or reject guide applications.

Workflow
- Admin reviews guide applications and decides outcome.

Technical details
- API: `GET /api/admin/guide-applications`, `PATCH /api/admin/guide-applications/:id`
- UI: `frontend/src/components/dashboard/AdminGuideApplicationsPanel.jsx`

### 6.3 Role and Access Management (Admin)
Purpose
- Ensure proper access control across user roles.

Workflow
- Admin promotes/demotes/suspends accounts.

Technical details
- UI: `frontend/src/pages/AdminDashboardPage.jsx`

## 7. Admin Events and Festivals

### 7.1 Publish Events/Festivals (Admin)
Purpose
- Allow admins to publish featured events and festivals.

Workflow
- Admin creates events and manages approval workflow.

Technical details
- API: `POST /api/events`, `POST /api/events/:id/approve`, `POST /api/events/:id/reject`
- UI: `frontend/src/pages/AdminDashboardPage.jsx`
