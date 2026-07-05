# Vyaktrix 2.0 - Free Deployment Guide (No VPS)

## Step 1: Create a GitHub account
1. Go to https://github.com
2. Enter your email, click **Sign up**
3. Create a username and password
4. Verify your email

## Step 2: Upload your project to GitHub

1. Go to https://github.com/new
2. In "Repository name" type: `vyaktrix`
3. Click **Create repository** (green button)
4. On the next page, look for the section **"…or create a new repository on the command line"**
5. **On your Windows computer**, open PowerShell:
   ```
   cd C:\Users\abbhi\Desktop\p6470
   git init
   git add .
   git commit -m "first commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/vyaktrix.git
   git push -u origin main
   ```
   (Replace `YOUR_USERNAME` with your actual GitHub username)

## Step 3: Create a free database on Neon

1. Go to https://neon.tech
2. Click **Sign Up** (use GitHub or email)
3. Click **Create a project**
4. **Project name**: `vyaktrix`
5. **Postgres version**: 16
6. **Region**: Pick closest to you
7. Click **Create project**
8. You'll see a connection string like:
   `postgresql://user:password@ep-xxxx.us-east-2.aws.neon.tech/vyaktrix?sslmode=require`
9. **Copy this entire string** — you'll need it later

## Step 4: Deploy backend on Render

1. Go to https://render.com
2. Click **Get Started** or **Sign Up**
3. Sign up with **GitHub** (click the GitHub button)
4. Authorize Render to access your GitHub
5. On the dashboard, click **New +** → **Web Service**
6. Click **Connect a repository** → find and click **vyaktrix**
7. In the next page, fill:

   | Field | Value |
   |-------|-------|
   | **Name** | `vyaktrix-backend` |
   | **Root Directory** | `backend` |
   | **Runtime** | `Node` |
   | **Build Command** | `npm install && npm run build` |
   | **Start Command** | `npm start` |
   | **Plan** | Select **Free** ($0/month) |

8. Click **Advanced** (at the bottom)
9. Click **Add Environment Variable**
10. Add these ONE BY ONE:

    | Key | Value |
    |-----|-------|
    | `NODE_ENV` | `production` |
    | `DATABASE_URL` | Paste the Neon connection string from Step 3 |
    | `JWT_SECRET` | Type: `ksjdfh23784shdfkjshdf8743` (any random letters) |
    | `JWT_REFRESH_SECRET` | Type: `3487shdfksjhdf3847shdkfjsh` (any random letters) |
    | `JWT_EXPIRES_IN` | `15m` |
    | `JWT_REFRESH_EXPIRES_IN` | `7d` |
    | `FRONTEND_URL` | `https://vyaktrix-frontend.vercel.app` (we'll update this later) |
    | `REDIS_URL` | (leave blank for now) |

11. Scroll down and click **Create Web Service**

**Wait 3-5 minutes** for the build. When done, you'll see a URL like:
`https://vyaktrix-backend.onrender.com`

12. Click that URL. Add `/api/health` at the end. You should see:
    ```json
    {"status":"ok", "timestamp":"..."}
    ```

13. **Copy your Render URL** (e.g., `https://vyaktrix-backend.onrender.com`)

## Step 5: Deploy database migrations

1. In Render dashboard, click your backend service
2. Click **Shell** tab
3. Type: `npx drizzle-kit push:pg`
4. Wait for "All tables created" message

## Step 6: Deploy frontend on Vercel

1. Go to https://vercel.com
2. Click **Sign Up** → **Continue with GitHub**
3. Find and click **Import** next to your `vyaktrix` repository
4. On the next page:

   | Field | Value |
   |-------|-------|
   | **Root Directory** | Select `frontend` |
   | **Framework** | Should auto-detect: `Next.js` |

5. Click **Environment Variables**
6. Add:

   | Key | Value |
   |-----|-------|
   | `NEXT_PUBLIC_API_URL` | `https://vyaktrix-backend.onrender.com/api` |
   | `NEXT_PUBLIC_WS_URL` | `https://vyaktrix-backend.onrender.com` |

   (Replace with your actual Render URL)

7. Click **Deploy**
8. Wait 2 minutes. When done, you'll get a URL like:
   `https://vyaktrix-frontend.vercel.app`

9. **Click the URL** — your Vyaktrix site is live!

## Step 7: Connect your domain

1. Go to https://vercel.com → click your project → **Settings** → **Domains**
2. Type your domain (e.g., `yourdomain.com`) → Click **Add**
3. Vercel will show you DNS instructions

4. Open a new tab → go to **https://hpanel.hostinger.com**
5. Click **Domains** → click your domain → **DNS Zone**
6. Remove any existing `A` or `CNAME` records for `@` and `www`
7. Add these records exactly:

   | Type | Name | Value | TTL |
   |------|------|-------|-----|
   | CNAME | @ | `cname.vercel-dns.com` | 3600 |
   | CNAME | www | `cname.vercel-dns.com` | 3600 |

8. For the API subdomain, add:
   
   | Type | Name | Value | TTL |
   |------|------|-------|-----|
   | CNAME | api | `vyaktrix-backend.onrender.com` | 3600 |

9. Wait 5-30 minutes for DNS to update

10. Back in Vercel, it will show **"Domain is valid"** once it's working

## Step 8: Update backend with your domain

1. Go to **Render dashboard** → click your backend service
2. Click **Environment**
3. Click **Edit**
4. Change `FRONTEND_URL` to `https://yourdomain.com`
5. Click **Save Changes**
6. Wait for auto-redeploy

## Done! Your website is live at:
- **Main site**: `https://yourdomain.com`
- **API**: `https://yourdomain.com/api`
- **Admin panel**: `https://yourdomain.com/admin`

## Testing
1. Go to your domain → click **Sign Up**
2. Create an account
3. Start posting tweets!

## If something breaks:

**Backend errors:** https://render.com → click backend → **Logs** tab → scroll

**Frontend errors:** https://vercel.com → click frontend → **Logs**

**Database errors:** https://neon.tech → click project → **Tables** → see your data

---

## Summary (quick reference)

| Service | What it does | Cost |
|---------|-------------|------|
| GitHub | Stores your code | Free |
| Neon.tech | Database (PostgreSQL) | Free |
| Render | Runs your backend API | Free |
| Vercel | Hosts your frontend | Free |
| Hostinger | Your domain DNS | Already paid |
