# ZAMZAM Store — Store + Real Authentication

## Included
- Clothing store UI
- User registration/login
- Username + password
- Email OR phone
- Verification code (OTP)
- Email OTP through SMTP
- Optional SMS OTP through Twilio
- Password hashing with bcrypt
- JWT session in HttpOnly cookie
- SQLite database
- Admin dashboard
- Product management
- Cart stored in browser
- Orders endpoint
- Rate limiting on authentication endpoints

## Run
Requirements: Node.js 18+.

1. Copy `.env.example` to `.env`.
2. Fill SMTP settings for real email verification.
3. Optional: fill Twilio settings for SMS verification.
4. Run:
   npm install
   npm start
5. Open:
   http://localhost:3000

## First admin
For safety, the first registered account is NOT automatically admin.
Open SQLite and set `is_admin=1` for the account you want to administer, or add an admin seed later.

## Important
Real email/SMS verification requires your own SMTP/Twilio credentials. The project does not contain fake credentials.
