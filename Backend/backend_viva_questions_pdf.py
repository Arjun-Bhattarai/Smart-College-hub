from pathlib import Path


OUTPUT = Path(__file__).with_name("Smart_College_Hub_Backend_Questions.pdf")


SECTIONS = [
    (
        "Project Overview",
        [
            ("What is Smart College Hub?", "Smart College Hub is a backend-supported college platform that helps students use features such as authentication, coding challenges, and collaboration in one system."),
            ("What problem does your project solve?", "The project solves the problem of scattered student activities by keeping learning, coding practice, and collaboration features in a centralized application."),
            ("What are the main backend modules?", "Auth, token, coding challenges, collaborations, join requests, and memberships."),
            ("Why did you choose FastAPI?", "FastAPI was chosen because it is fast, supports async programming, provides automatic API documentation, validates data using type hints, and is simple to structure."),
            ("What is the role of app/main.py?", "It creates the FastAPI app, adds middleware, and registers all routers."),
            ("How is the backend connected to the frontend?", "Frontend calls REST APIs exposed by FastAPI using HTTP requests."),
            ("What is a router in FastAPI?", "A router groups related endpoints so the code stays organized."),
            ("Why did you separate routes, services, repositories, models, and schemas?", "Separation makes the code maintainable, testable, and easier to explain."),
            ("Explain the request flow in your backend.", "Request goes to route, route calls service, service calls repository, repository uses database, then response is returned."),
            ("What future improvements can be added?", "Testing, deployment, rate limiting, better logging, notifications, and production security hardening."),
        ],
    ),
    (
        "FastAPI",
        [
            ("What is FastAPI?", "A modern Python framework for building APIs quickly with automatic validation and docs."),
            ("What are the benefits of FastAPI?", "High performance, async support, type hints, Swagger docs, and dependency injection."),
            ("What is an endpoint?", "A URL path plus HTTP method that performs a backend action."),
            ("What is include_router() used for?", "It attaches route groups to the main FastAPI app."),
            ("What are tags in FastAPI?", "Tags organize endpoints in the Swagger documentation."),
            ("What is Swagger UI?", "The automatic interactive API documentation available in the browser."),
            ("What is dependency injection?", "FastAPI automatically provides required objects like database sessions or current users."),
            ("What is Depends()?", "It declares a dependency that FastAPI should run before the endpoint."),
            ("Why use async functions?", "They help handle database and network operations efficiently."),
            ("What is middleware?", "Code that runs before or after requests, such as CORS middleware."),
        ],
    ),
    (
        "Authentication",
        [
            ("How does registration work?", "The backend validates user data, hashes the password, and stores the user."),
            ("How does login work?", "The backend checks email/username and password, then returns tokens if valid."),
            ("Why do we hash passwords?", "So original passwords are not stored and cannot be easily stolen."),
            ("Which hashing library is used?", "Passlib with bcrypt."),
            ("What is bcrypt?", "A secure password hashing algorithm designed to be slow against brute-force attacks."),
            ("How do you verify passwords?", "Compare the plain password with the stored hash using verify_password()."),
            ("What happens if credentials are invalid?", "The backend returns an authentication error instead of a token."),
            ("What is the role of AuthService?", "It contains authentication business logic."),
            ("What is the role of UserRepository?", "It handles user-related database operations."),
            ("Why not store password in plain text?", "It is a serious security risk if the database is leaked."),
        ],
    ),
    (
        "JWT And Tokens",
        [
            ("What is JWT?", "A signed token used to securely transfer user identity and claims."),
            ("Why did you use JWT?", "It allows stateless authentication between frontend and backend."),
            ("What data is inside your token?", "uid, email, username, role, expiry, jti, and refresh flag."),
            ("What is an access token?", "A short-lived token used to access protected APIs."),
            ("What is a refresh token?", "A longer-lived token used to generate a new access token."),
            ("Difference between access and refresh token?", "Access token is for API access; refresh token is for renewing access."),
            ("Why does the access token expire?", "To reduce damage if the token is stolen."),
            ("What is jti?", "A unique token ID used for tracking and blacklisting tokens."),
            ("Why is uid validated as UUID?", "To ensure token identity format is valid and safe."),
            ("What happens when a token expires?", "The backend returns 401 Unauthorized."),
            ("What happens when a token is invalid?", "The backend rejects it with an invalid token error."),
            ("How does logout work?", "The token can be added to a blacklist so it cannot be reused."),
            ("Why use Redis for token blacklist?", "Redis is fast and good for temporary token storage."),
            ("What is the JWT secret?", "A private key used to sign and verify tokens."),
            ("Why store JWT secret in .env?", "Secrets should not be hardcoded in source code."),
        ],
    ),
    (
        "Authorization And Roles",
        [
            ("What is authentication?", "Checking who the user is."),
            ("What is authorization?", "Checking what the user is allowed to do."),
            ("Difference between authentication and authorization?", "Authentication verifies identity; authorization verifies permission."),
            ("What is role-based access control?", "Access is allowed based on user roles such as student or admin."),
            ("How does RoleChecker work?", "It checks if the current user's role is inside allowed_roles."),
            ("What happens if a user has no permission?", "The backend returns 403 Forbidden."),
            ("Why protect routes?", "To prevent unauthorized users from accessing private data or actions."),
            ("Where is the current user retrieved?", "From token data using get_current_user()."),
        ],
    ),
    (
        "Database",
        [
            ("Which database layer is used?", "SQLModel with SQLAlchemy async session."),
            ("What is SQLModel?", "A library combining Pydantic-style validation with SQLAlchemy ORM features."),
            ("What is an ORM?", "Object Relational Mapper; it maps Python classes to database tables."),
            ("Why use ORM?", "It makes database operations easier and safer than raw SQL for common tasks."),
            ("What is AsyncSession?", "An async database session used for non-blocking database operations."),
            ("What does get_session() do?", "It creates and yields a database session for each request."),
            ("What is DATABASE_URL?", "The connection string used to connect the backend to the database."),
            ("What is a model?", "A Python class that represents a database table."),
            ("What is a schema?", "A validation and serialization structure for request and response data."),
            ("Difference between model and schema?", "Model maps to database; schema controls API data shape."),
            ("What is a primary key?", "A unique identifier for each row in a table."),
            ("What is a foreign key?", "A field that links one table to another table."),
            ("What is cascade delete?", "Related child records are deleted when the parent record is deleted."),
            ("Why use indexes?", "Indexes speed up searches and filtering on important columns."),
        ],
    ),
    (
        "Alembic Migrations",
        [
            ("What is Alembic?", "A database migration tool for SQLAlchemy projects."),
            ("Why are migrations needed?", "They track and apply database structure changes safely."),
            ("What is a migration file?", "A versioned script that changes the database schema."),
            ("Why not manually edit database tables?", "Manual changes are hard to track and can break team consistency."),
            ("How do migrations help deployment?", "They let production database schema match the application code."),
            ("What happens when a model changes?", "A new migration should be created and applied."),
            ("Why keep migration files in Git?", "They document database history with the codebase."),
        ],
    ),
    (
        "CORS",
        [
            ("What is CORS?", "A browser security rule controlling cross-origin frontend-backend requests."),
            ("Why did you add CORS middleware?", "To allow the frontend running on localhost ports to call the backend."),
            ("What happens without CORS?", "The browser may block frontend API requests."),
            ("Why list specific localhost origins?", "It allows development frontend URLs without opening the API to every origin."),
            ("What does allow_methods=['*'] mean?", "All HTTP methods like GET, POST, PUT, DELETE are allowed."),
            ("What does allow_headers=['*'] mean?", "All request headers are allowed."),
            ("What does allow_credentials=True mean?", "Credentials such as auth headers can be included in requests."),
            ("Should all origins be allowed in production?", "No, production should allow only trusted domains."),
        ],
    ),
    (
        "Collaboration Module",
        [
            ("What is the collaboration feature?", "It lets users create, join, and manage collaboration groups/projects."),
            ("Why separate collaboration routes?", "To keep collaboration logic organized and independent."),
            ("What is a join request?", "A request from a user to join a collaboration."),
            ("What is membership?", "A record showing that a user belongs to a collaboration."),
            ("Difference between owner and member?", "Owner manages the collaboration; member participates in it."),
            ("How do you prevent duplicate membership?", "Using service checks or database constraints."),
            ("How are join requests approved?", "The owner/admin accepts the request and membership is created."),
            ("What happens when a collaboration is deleted?", "Related memberships and requests can be removed through cascade rules."),
            ("Why have separate join request and membership tables?", "A request is pending approval; membership means the user has joined."),
            ("What validation is needed in collaboration APIs?", "Check ownership, membership status, duplicate requests, and permissions."),
        ],
    ),
    (
        "Coding Challenge Module",
        [
            ("What is the coding challenge module?", "It manages coding problems and student submissions."),
            ("Who can create challenges?", "Challenge creation should be limited to authorized users such as admins or teachers so students cannot modify official challenge content."),
            ("What is a submission?", "A student's answer or code submitted for a challenge."),
            ("Why store submission feedback?", "So students can see evaluation comments or results."),
            ("Why add submission indexes?", "To make submission searches and filters faster."),
            ("How does the backend validate challenge data?", "Using schemas and service-layer checks."),
            ("What endpoints are expected for challenges?", "Create, list, detail, update, delete, and submit."),
            ("What improvement could be added?", "Automatic code execution, test cases, leaderboard, and plagiarism checks."),
        ],
    ),
    (
        "Repository And Service Pattern",
        [
            ("What is repository pattern?", "A layer that handles database queries separately from business logic."),
            ("What is a service layer?", "A layer that contains business rules and coordinates repositories."),
            ("Why not write everything in route files?", "Routes become messy and hard to test if they contain all logic."),
            ("What belongs in routes?", "Request/response handling, dependencies, and calling services."),
            ("What belongs in services?", "Business logic such as validation, permissions, and workflows."),
            ("What belongs in repositories?", "Database create, read, update, delete operations."),
            ("How does this structure improve maintainability?", "Each file has one responsibility and changes are easier to isolate."),
            ("How does this help testing?", "Services and repositories can be tested separately."),
        ],
    ),
    (
        "Errors And Status Codes",
        [
            ("What is HTTPException?", "FastAPI's way to return controlled HTTP errors."),
            ("When do you return 400?", "Bad request or invalid input."),
            ("When do you return 401?", "User is not authenticated or token is invalid."),
            ("When do you return 403?", "User is authenticated but not allowed."),
            ("When do you return 404?", "Requested resource was not found."),
            ("When do you return 500?", "Unexpected server error."),
            ("How are expired tokens handled?", "JWT decode catches expiry and returns 401."),
            ("How are invalid UUIDs handled?", "The backend rejects them with an authentication error."),
            ("Why should error messages be clear?", "They help frontend and users understand what went wrong."),
        ],
    ),
    (
        "Security",
        [
            ("How is your backend secured?", "Password hashing, JWT auth, role checks, token blacklist, and environment secrets."),
            ("What if JWT secret is leaked?", "Attackers could create fake valid tokens."),
            ("Why use .env?", "To keep secrets and environment-specific settings outside source code."),
            ("Why is refresh token protection important?", "Refresh tokens can create new access tokens."),
            ("What is token blacklisting?", "Marking a token as invalid before its normal expiry."),
            ("How can brute force login be reduced?", "Rate limiting, account lockout, captcha, and monitoring."),
            ("What production security improvements are needed?", "HTTPS, secure cookies, strict CORS, rate limiting, logging, and strong secrets."),
            ("Why should debug logging be reduced in production?", "Logs can leak sensitive data and reduce performance."),
        ],
    ),
    (
        "Deployment And Testing",
        [
            ("How would you deploy the backend?", "The backend can be deployed on a server using Uvicorn or Gunicorn, connected to a production database and Redis, configured with environment variables, and protected using HTTPS."),
            ("What is Uvicorn?", "An ASGI server used to run FastAPI applications."),
            ("Development vs production environment?", "Development is local and flexible; production must be secure and stable."),
            ("Why disable database echo in production?", "It prints SQL queries and may expose sensitive information."),
            ("How did you test APIs?", "Using Swagger UI, frontend requests, or tools like Postman."),
            ("What login test cases are important?", "Valid login, wrong password, missing fields, expired token, and logout."),
            ("What collaboration test cases are important?", "Create collaboration, request join, approve request, duplicate request, and permission checks."),
            ("How do you debug backend errors?", "Check logs, status codes, request data, database state, and token validity."),
        ],
    ),
    (
        "Most Important Viva Questions",
        [
            ("Explain your backend architecture.", "The backend follows a layered architecture where routes receive requests, services handle business logic, repositories handle database operations, models represent tables, and schemas validate API data."),
            ("Explain login from frontend to backend.", "Frontend sends credentials, backend verifies password, returns JWT tokens."),
            ("Why did you use JWT?", "For stateless secure authentication."),
            ("Difference between access token and refresh token?", "Access is short-lived for APIs; refresh is longer-lived for renewal."),
            ("What is Redis used for?", "Token blacklist storage."),
            ("What is CORS?", "Browser rule for allowing frontend-backend communication across origins."),
            ("What are Alembic migrations?", "Version-controlled database schema changes."),
            ("Explain collaboration module.", "Users create collaborations, send join requests, and become members after approval."),
            ("Explain coding challenge module.", "It manages challenges and student submissions/feedback."),
            ("What would you improve next?", "Testing, deployment, notifications, rate limiting, and stronger production security."),
        ],
    ),
    (
        "Extended Defense Questions",
        [
            ("What is Smart College Hub?", "It is a full-stack college collaboration platform for authentication, coding challenges, submissions, leaderboards, and collaboration management."),
            ("What problem does it solve?", "It centralizes student learning, coding practice, and team collaboration in one system."),
            ("Who are the users of this system?", "The main roles are admin, teacher, and student."),
            ("What are the core features of the project?", "Signup, login, role-based access, coding challenge management, submission review, leaderboard, collaboration groups, join requests, and member management."),
            ("Why did you choose FastAPI for the backend?", "FastAPI is async-friendly, fast, and gives automatic API documentation."),
            ("Why did you choose React for the frontend?", "React is good for building interactive user interfaces and dynamic screens."),
            ("Why did you use PostgreSQL?", "It is reliable and suitable for relational data like users, challenges, submissions, and collaborations."),
            ("Why is Redis used in the project?", "Redis is used for token blacklisting and fast temporary backend storage."),
            ("Why did you use Docker?", "Docker makes the setup consistent and helps run backend, frontend, PostgreSQL, and Redis together."),
            ("What is Alembic used for?", "Alembic manages database schema migrations."),
            ("How does user authentication work?", "Users sign up and log in with email and password, then receive JWT access and refresh tokens."),
            ("What is the difference between access token and refresh token?", "The access token is used for API authentication, while the refresh token is used to obtain a new access token."),
            ("How is password security handled?", "Passwords are hashed using bcrypt through Passlib."),
            ("What happens during logout?", "The access token JTI is blacklisted so the token can no longer be used."),
            ("What roles exist in the system?", "Admin, student, and teacher."),
            ("Who can create a challenge?", "Only admins."),
            ("Who can submit to a challenge?", "Authenticated users."),
            ("What happens after a submission is made?", "It is stored with the user ID, challenge ID, code, and programming language."),
            ("Who reviews submissions?", "Admins review submissions and assign score, status, and feedback."),
            ("Can a challenge be deleted?", "Yes, but only by an admin."),
            ("What is the collaboration feature?", "It allows users to create project groups, request membership, and manage team participation."),
            ("What happens when someone creates a collaboration?", "The creator is automatically added as a member."),
            ("How do users join a collaboration?", "They send a join request."),
            ("Can a member leave a collaboration?", "Yes."),
            ("What information does a collaboration store?", "Title, description, max members, required skills, creator, and timestamps."),
            ("What is the frontend built with?", "React and Vite."),
            ("Why did you use TanStack Router?", "It provides structured route-based navigation."),
            ("Why did you use TanStack Query?", "It helps manage server state, caching, and data fetching."),
            ("Why did you use React Hook Form and Zod?", "They simplify form handling and validation."),
            ("Why did you use Radix UI and Tailwind CSS?", "Radix gives accessible UI primitives, and Tailwind helps build the design quickly and consistently."),
            ("What is the purpose of repositories in your backend?", "They isolate database operations from business logic."),
            ("Why are services separate from routes?", "Routes handle HTTP requests, while services contain business rules."),
            ("Why are schemas separate from models?", "Schemas validate API input and output, while models represent database entities."),
            ("How do you prevent unauthorized access?", "Through JWT authentication and role-based access control."),
            ("How do you reduce token misuse?", "By using refresh tokens and blacklisting logged-out access tokens."),
            ("What are the security strengths of your project?", "Password hashing, token-based auth, role checks, and protected admin routes."),
            ("What are the limitations of the current version?", "Not all broader college features like notices, events, and study material sharing are implemented."),
            ("How would you improve the project in the future?", "Add notices, events, chat, file sharing, notifications, better analytics, and possibly real-time collaboration."),
            ("How can this project be run locally?", "Through Docker Compose or by running the backend and frontend separately with the configured environment."),
            ("What did you learn from building this project?", "API design, authentication, role-based control, database modeling, frontend routing, and full-stack integration."),
            ("If the examiner asks why your project matters, what will you say?", "It demonstrates a realistic college platform that combines authentication, teamwork, and coding evaluation in one system."),
            ("If the examiner asks for the main highlight of your project, what should you answer?", "The strongest part is the integration of coding challenges, submission review, leaderboard, and collaboration management with secure role-based access."),
        ],
    ),
]


def escape_pdf(text: str) -> str:
    return text.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")


def wrap_text(text: str, max_chars: int) -> list[str]:
    words = text.split()
    lines: list[str] = []
    current = ""
    for word in words:
        if len(current) + len(word) + (1 if current else 0) <= max_chars:
            current = f"{current} {word}".strip()
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def add_text_line(commands: list[str], x: int, y: int, text: str, size: int = 10, bold: bool = False) -> None:
    font = "F2" if bold else "F1"
    commands.append(f"BT /{font} {size} Tf {x} {y} Td ({escape_pdf(text)}) Tj ET")


def build_pages() -> list[str]:
    pages: list[str] = []
    commands: list[str] = []
    y = 800
    page_no = 1

    def new_page() -> None:
        nonlocal commands, y, page_no
        add_text_line(commands, 50, 28, f"Smart College Hub Backend Viva Questions | Page {page_no}", 8)
        pages.append("\n".join(commands))
        commands = []
        page_no += 1
        y = 800

    add_text_line(commands, 50, y, "Smart College Hub Backend Viva Questions", 18, True)
    y -= 28
    add_text_line(commands, 50, y, "Question list with direct answers for college backend presentation preparation.", 10)
    y -= 30

    question_number = 1
    for section, questions in SECTIONS:
        if y < 90:
            new_page()
        add_text_line(commands, 50, y, section, 13, True)
        y -= 20
        for question, hint in questions:
            q_lines = wrap_text(f"{question_number}. {question}", 88)
            h_lines = wrap_text(f"Answer: {hint}", 92)
            needed = (len(q_lines) + len(h_lines)) * 13 + 8
            if y - needed < 55:
                new_page()
            for line in q_lines:
                add_text_line(commands, 58, y, line, 10, True)
                y -= 13
            for line in h_lines:
                add_text_line(commands, 72, y, line, 9)
                y -= 12
            y -= 5
            question_number += 1
        y -= 8

    new_page()
    return pages


def write_pdf(page_streams: list[str]) -> None:
    objects: list[bytes] = []

    def obj(data: str) -> int:
        objects.append(data.encode("latin-1"))
        return len(objects)

    catalog_id = obj("<< /Type /Catalog /Pages 2 0 R >>")
    pages_id = obj("PLACEHOLDER")
    font_regular_id = obj("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>")
    font_bold_id = obj("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>")

    page_ids: list[int] = []
    for stream in page_streams:
        stream_bytes = stream.encode("latin-1")
        content_id = obj(f"<< /Length {len(stream_bytes)} >>\nstream\n{stream}\nendstream")
        page_id = obj(
            "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] "
            f"/Resources << /Font << /F1 {font_regular_id} 0 R /F2 {font_bold_id} 0 R >> >> "
            f"/Contents {content_id} 0 R >>"
        )
        page_ids.append(page_id)

    kids = " ".join(f"{page_id} 0 R" for page_id in page_ids)
    objects[pages_id - 1] = f"<< /Type /Pages /Kids [{kids}] /Count {len(page_ids)} >>".encode("latin-1")
    objects[catalog_id - 1] = b"<< /Type /Catalog /Pages 2 0 R >>"

    pdf = bytearray(b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n")
    offsets = [0]
    for index, data in enumerate(objects, start=1):
        offsets.append(len(pdf))
        pdf.extend(f"{index} 0 obj\n".encode("latin-1"))
        pdf.extend(data)
        pdf.extend(b"\nendobj\n")

    xref_offset = len(pdf)
    pdf.extend(f"xref\n0 {len(objects) + 1}\n".encode("latin-1"))
    pdf.extend(b"0000000000 65535 f \n")
    for offset in offsets[1:]:
        pdf.extend(f"{offset:010d} 00000 n \n".encode("latin-1"))
    pdf.extend(
        f"trailer\n<< /Size {len(objects) + 1} /Root 1 0 R >>\nstartxref\n{xref_offset}\n%%EOF\n".encode("latin-1")
    )
    OUTPUT.write_bytes(pdf)


if __name__ == "__main__":
    write_pdf(build_pages())
    print(OUTPUT)
