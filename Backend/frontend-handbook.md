# Smart College Hub Frontend Handbook

This document is the frontend source of truth for the current FastAPI backend. It is intentionally specific to the routes, payloads, and role rules already in the codebase so you can build the UI without guessing.

## 1. Product Scope

The frontend has four real feature areas:

1. Authentication and profile access.
2. Coding challenge browsing, submission, leaderboard, and admin review.
3. Collaboration browsing and management.
4. Join-request and membership management for collaboration owners.

The backend already enables CORS for a Vite dev frontend on `http://localhost:8081`, so that should be the local frontend origin unless you update the backend allow-list.

## 2. User Roles

The backend currently distinguishes these roles:

- `user` is the default role created at signup.
- `student` is allowed by the auth role checker.
- `teacher` is allowed by the auth role checker.
- `admin` is allowed by the auth role checker and is required for challenge creation and submission review routes.

For the frontend, treat roles as UI guards, not just labels.

- `guest` can view public lists and details.
- `authenticated user` can submit challenges, create collaborations, request to join collaborations, leave collaborations, and view their own profile/submissions.
- `collaboration owner` can update or delete their collaboration, view join requests, approve/reject join requests, and remove members.
- `admin` can create challenges and review submissions.

## 3. Screen Map

Build the app around these screens or route groups:

- `/` landing page with login/signup entry points and summary cards.
- `/auth/login` login form.
- `/auth/signup` signup form.
- `/dashboard` authenticated home with quick links to profile, challenges, collaborations, and leaderboard.
- `/challenges` challenge catalog.
- `/challenges/:challengeId` challenge detail page.
- `/challenges/:challengeId/submit` submission editor, or a submit modal from the detail page.
- `/challenges/leaderboard` leaderboard.
- `/challenges/my-submissions` personal submission history.
- `/collaborations` collaboration catalog.
- `/collaborations/new` collaboration creation form.
- `/collaborations/:collaborationId` collaboration detail page.
- `/collaborations/:collaborationId/edit` owner edit form.
- `/collaborations/:collaborationId/members` member list and owner controls.
- `/collaborations/:collaborationId/join-requests` owner inbox for pending join requests.
- `/profile` current user profile.

If you want a smaller MVP, the minimum viable set is login, signup, challenge list/detail/submit, collaboration list/detail/create, and profile.

## 4. API Contract

Use one API client with a single base URL, for example `VITE_API_BASE_URL`.

### Authentication

`POST /auth/signup`

Request body:

- `username: string`
- `email: string`
- `password: string`
- `first_name?: string`
- `last_name?: string`
- `title?: string`

Response:

- A `UserResponse` object with `uid`, `title`, `username`, `email`, `first_name`, `last_name`, `role`, `is_verified`, `created_at`, and `updated_at`.

Frontend behavior:

- Validate email format and keep password at least 5 characters.
- After signup, redirect to login or auto-login if you choose to wire that later.

`POST /auth/login`

Request body:

- `email: string`
- `password: string`

Response:

- `message`
- `access_token`
- `refresh_token`
- `user: { uid, email, username, role }`

Frontend behavior:

- Store the tokens in one place and hydrate auth state from them on app start.
- Keep the `user` object in app state so you do not have to re-fetch profile immediately after login.

`GET /auth/profile`

Auth:

- Requires a bearer access token.

Response:

- Full `UserResponse`.

Frontend behavior:

- Call this on app bootstrap if tokens exist, especially after refresh or page reload.

`GET /auth/logout`

Auth:

- Requires a bearer access token.

Response:

- `{ message: "Logout successful" }`

Frontend behavior:

- Clear local auth state after the request succeeds or fails, because the goal is to end the client session either way.

`GET /token/refresh`

Auth:

- Requires a bearer refresh token.

Response:

- `{ message: "Token refreshed successfully", access_token }`

Frontend behavior:

- Retry exactly one failed request after refreshing the access token.
- If refresh fails, force logout and redirect to login.

### Coding Challenges

`GET /challenges`

Response shape:

- List of challenge objects with `id`, `title`, `description`, `difficulty`, `starter_code`, and `created_at`.

Frontend behavior:

- Render cards with title, difficulty badge, short description, and submit/view actions.

`POST /challenges/`

Auth:

- Admin only.

Request body:

- `title: string`
- `description: string`
- `difficulty: string`
- `starter_code?: string`

Frontend behavior:

- Hide the create form unless the current user is `admin`.

`GET /challenges/{challenge_id}`

Response shape:

- Single challenge object.

Frontend behavior:

- Use this for detail pages and for pre-filling the submit page with starter code.

`POST /challenges/{challenge_id}/submit`

Auth:

- Requires a bearer access token.

Request body:

- `code: string`
- `language: string`

Response shape:

- Submission object with `id`, `status`, `score`, and `submitted_at`.

Frontend behavior:

- Keep the editor state local until submit succeeds.
- Show pending/success/failure states based on backend response and error payloads.

`GET /challenges/my-submissions`

Auth:

- Requires a bearer access token.

Response shape:

- List of submissions with `id`, `status`, `score`, and `submitted_at`.

Frontend behavior:

- Show this as a personal activity timeline.

`GET /challenges/leaderboard`

Response shape:

- List of objects containing `user_id` and `points`.

Frontend behavior:

- This endpoint returns only IDs and points, so if you want usernames you must enrich the data separately from profile/user data.

`GET /challenges/users/{user_id}/submissions`

Auth:

- Admin only.

Response shape:

- User submissions list.

`GET /challenges/{challenge_id}/submissions`

Auth:

- Admin only.

Response shape:

- List of submissions for that challenge.

`GET /challenges/submissions/{submission_id}`

Auth:

- Admin only.

Response shape:

- Single submission object.

`PATCH /challenges/submissions/{submission_id}`

Auth:

- Admin only.

Request body:

- `score: number`
- `status: string`
- `feedback?: string`

Frontend behavior:

- Use this in a submission review drawer or admin detail screen.
- Keep status labels explicit, for example `pending`, `accepted`, `rejected`, or whatever your backend team standardizes later.

### Collaborations

`POST /collaborations`

Auth:

- Requires a bearer access token.

Request body:

- `title: string`
- `description?: string`
- `max_members?: number`
- `required_skills: string[]`

Response shape:

- Collaboration object with `id`, `title`, `description`, `max_members`, `required_skills`, `created_by`, `created_at`, and `updated_at`.

Frontend behavior:

- After creation, the backend automatically adds the creator as a member.
- Redirect the creator to the collaboration detail page after a successful create.

`GET /collaborations`

Response shape:

- List of collaboration objects.

Frontend behavior:

- Render searchable cards with member-focused metadata such as required skills and max members.

`GET /collaborations/{collaboration_id}`

Response shape:

- Single collaboration object.

Frontend behavior:

- Use this to populate the detail screen and edit screen.

`PATCH /collaborations/{collaboration_id}`

Auth:

- Requires a bearer access token.
- Only the owner can update.

Request body:

- `title?: string`
- `description?: string`
- `max_members?: number`
- `required_skills?: string[]`

Frontend behavior:

- Hide the edit button unless `current_user.uid === collaboration.created_by`.

`DELETE /collaborations/{collaboration_id}`

Auth:

- Requires a bearer access token.
- Only the owner can delete.

Response shape:

- `{ message: "Collaboration deleted successfully." }`

Frontend behavior:

- Ask for confirmation before destructive deletion.

### Join Requests and Members

`POST /collaborations/{collaboration_id}/join`

Auth:

- Requires a bearer access token.

Response behavior:

- Creates a pending join request unless the user is the owner or already a member.

Frontend behavior:

- Disable the join button if the user is already a member, has already requested, or is the owner.

`GET /collaborations/{collaboration_id}/join-requests`

Auth:

- Requires a bearer access token.
- Only the owner can view requests.

Response shape:

- List of join request objects with `id`, `collaboration_id`, `user_id`, `status`, and `requested_at`.

Frontend behavior:

- Show a queue with approve and reject buttons.

`PATCH /collaborations/join-requests/{request_id}/approve`

Auth:

- Requires a bearer access token.
- Only the owner can approve.

Response shape:

- Updated join request object.

Frontend behavior:

- After approval, refresh both the request list and the member list.

`PATCH /collaborations/join-requests/{request_id}/reject`

Auth:

- Requires a bearer access token.
- Only the owner can reject.

Response shape:

- Updated join request object.

`GET /collaborations/{collaboration_id}/members`

Response shape:

- List of members with `id`, `user_id`, `collaboration_id`, `role`, and `joined_at`.

Frontend behavior:

- Use this to show the roster and owner actions.

`DELETE /collaborations/{collaboration_id}/members/{user_id}`

Auth:

- Requires a bearer access token.
- Only the owner can remove members.

Response shape:

- `{ message: "Member removed successfully." }`

`DELETE /collaborations/{collaboration_id}/leave`

Auth:

- Requires a bearer access token.

Response shape:

- `{ message: "You left the collaboration successfully." }`

Frontend behavior:

- Prevent the owner from leaving; the backend rejects that case.

## 5. Data Shapes You Should Type in the Frontend

Create explicit frontend types for these backend objects:

- `UserResponse`
- `LoginResponse`
- `Challenge`
- `Submission`
- `LeaderboardEntry`
- `Collaboration`
- `JoinRequest`
- `Membership`

Keep the frontend types close to the backend fields. Do not invent nested wrappers unless the backend actually returns them.

### Minimal Type Rules

- UUIDs are strings in the browser.
- `created_at`, `updated_at`, `submitted_at`, `requested_at`, and `joined_at` should be treated as ISO date strings until you format them in the UI.
- `required_skills` is a string array, not a comma-delimited string.

## 6. Auth Flow Design

Use one auth store with these values:

- `accessToken`
- `refreshToken`
- `user`
- `isHydrated`

Recommended flow:

1. On app boot, read persisted tokens.
2. If an access token exists, try `/auth/profile`.
3. If profile fails with 401 and a refresh token exists, call `/token/refresh`.
4. Store the new access token and retry profile once.
5. If refresh fails, clear tokens and show login.

Do not spread token logic across components. Keep all auth decisions in one API layer.

## 7. API Client Rules

Your HTTP client should:

- Add `Authorization: Bearer <access_token>` only when a token exists.
- Retry one time after a refresh if a request returns 401.
- Never retry non-idempotent actions more than once.
- Surface backend error `detail` messages in toast or form errors when available.

Do not silence the backend errors. The backend already uses meaningful messages such as:

- `User already exists`
- `Invalid credentials`
- `Challenge not found.`
- `Collaboration not found.`
- `Only the owner can update this collaboration.`

Those strings should be visible to the user or mapped to clear UI messages.

## 8. Recommended Frontend Folder Structure

For a React + Vite app, a clean structure is:

```text
src/
  api/
    client.ts
    auth.ts
    challenges.ts
    collaborations.ts
  assets/
  components/
    common/
    layout/
    forms/
  features/
    auth/
    challenges/
    collaborations/
    profile/
  hooks/
  pages/
  routes/
  stores/
  types/
  utils/
```

Keep API wrappers in `src/api`, not inside page components.

## 9. UI Components Worth Building First

Build these reusable pieces before the page-level polish:

- `AppShell` with top nav, auth menu, and role badges.
- `ProtectedRoute` and `RoleGuard`.
- `FormField`, `TextAreaField`, `PasswordField`, and `SelectField`.
- `ChallengeCard` and `ChallengeHeader`.
- `CodeEditorPanel` or a plain textarea fallback if you do not want a full editor yet.
- `SubmissionStatusBadge`.
- `CollaborationCard`.
- `SkillChipsInput`.
- `MemberList`.
- `JoinRequestList`.
- `ConfirmDialog`.
- `Toast` or inline alert component.

## 10. Page Behavior Rules

### Login and Signup

- Keep forms simple and aligned to backend field names.
- Signup must collect `username`, `email`, and `password` at minimum.
- Display optional fields only if you want richer profiles from day one.

### Challenge Detail

- Show title, description, difficulty, starter code, and created time.
- If authenticated, show the submit action.
- If admin, show review/admin controls.

### Submission Flow

- Submission is a two-field form: `code` and `language`.
- After submit, show the returned submission `status` and `score`.
- Personal submission history should sort newest first, matching the backend query order.

### Collaboration Detail

- Show title, description, max members, required skills, owner, and current members.
- Show `Join` only if the viewer is not already a member and is not the owner.
- Show owner actions only if the current user created the collaboration.

### Join Request Inbox

- The owner screen should list pending requests with user IDs and timestamps.
- Approve and reject should refresh the list immediately after success.

## 11. Validation and Empty States

Each major page needs three states:

- loading
- empty
- error

Keep the loading state visible when you fetch lists like challenges, collaborations, members, and join requests.

Specific empty states to implement:

- no challenges yet
- no submissions yet
- no collaborations yet
- no join requests yet
- no members beyond the owner

## 12. Things To Keep Stable

These backend details should be treated as fixed until the API changes:

- CORS currently expects the frontend on `http://localhost:8081`.
- Logout is a `GET` request.
- Refresh is a `GET` request.
- Submission review is `PATCH`.
- Collaboration join approval/rejection is `PATCH`.
- Owners are auto-added as collaboration members on create.

## 13. MVP Build Order

If you are building the frontend in phases, do it in this order:

1. Auth pages and auth store.
2. Challenge list, detail, and submission form.
3. Collaboration list, detail, and create form.
4. Profile and my-submissions page.
5. Join-request inbox and member management.
6. Admin challenge create and submission review.

That sequence gives you a usable product early without blocking on admin screens.
