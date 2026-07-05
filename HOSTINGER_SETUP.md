# Vyaktrix 2.0 - Complete Hostinger Setup Guide for Beginners

## What you need before starting:
- A Hostinger VPS plan (not shared hosting)
- A domain name (e.g., yourdomain.com) pointed to your Hostinger server
- This project folder on your computer

---

## STEP 1: Find your VPS IP address

1. Log in to your Hostinger account at https://hpanel.hostinger.com
2. Go to **VPS** → click your VPS
3. You'll see an **IP address** (looks like `123.456.789.10`) — write this down
4. You'll also need your **root password** — Hostinger emailed it to you

---

## STEP 2: Connect to your VPS using SSH

### On Windows:
1. Open **PowerShell** (press Windows key, type "PowerShell", press Enter)
2. Type this command (replace IP with yours):
   ```
   ssh root@123.456.789.10
   ```
3. It will say "Are you sure you want to continue connecting?" — type `yes` and press Enter
4. Type your root password (you won't see anything on screen, that's normal)
5. Press Enter

**If SSH doesn't work:** Install PuTTY from https://putty.org, enter your IP, click Open, then login with root and your password.

**When you're connected successfully**, you'll see something like:
```
root@vps123:~#
```

---

## STEP 3: Update your VPS

Copy and paste this one line at a time, then press Enter after each:
```
apt update
apt upgrade -y
```

This updates all the system software. Wait for it to finish (2-5 minutes).

---

## STEP 4: Install all required software

Copy and paste this entire block, then press Enter:
```
apt install -y nginx postgresql postgresql-contrib redis-server curl git
```

This installs:
- **nginx** — web server that serves your website
- **postgresql** — database to store all data
- **redis** — cache to make things faster
- **curl** and **git** — useful tools

Wait 2-3 minutes for installation.

---

## STEP 5: Install Node.js (runs your backend)

Copy and paste these one at a time:
```
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
```
```
apt install -y nodejs
```

Check Node.js installed correctly:
```
node -v
npm -v
```

You should see `v20.x.x` and `10.x.x` or similar.

---

## STEP 6: Upload your project files

### On your local computer (Windows), open a NEW PowerShell window:

Navigate to where your project is:
```
cd C:\Users\abbhi\Desktop\p6470
```

Upload the entire project folder to your VPS (replace IP with yours):
```
scp -r * root@123.456.789.10:/var/www/vyaktrix
```

**If `scp` doesn't work**, use this method instead:

1. On your VPS, run:
   ```
   mkdir -p /var/www/vyaktrix
   cd /var/www/vyaktrix
   ```
2. Go to https://github.com and create a new repository
3. Upload your files there (or use Git)
4. On the VPS: `git clone https://github.com/yourusername/yourrepo.git .`

---

## STEP 7: Set up the database

Start PostgreSQL:
```
systemctl start postgresql
systemctl enable postgresql
```

Create the database (copy and paste these one at a time):
```
sudo -u postgres psql -c "CREATE DATABASE vyaktrix;"
```

Create a database user (replace `YourStrongPassword123` with something you'll remember):
```
sudo -u postgres psql -c "CREATE USER vyaktrix_user WITH PASSWORD 'YourStrongPassword123';"
```

Give the user permission:
```
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE vyaktrix TO vyaktrix_user;"
```

Exit PostgreSQL (type):
```
exit
```

---

## STEP 8: Configure your backend

Go to the backend folder:
```
cd /var/www/vyaktrix/backend
```

Make a copy of the environment file:
```
cp .env .env.backup
```

Edit the .env file:
```
nano .env
```

You'll see a file open. Use arrow keys to move around. Change these lines:

1. **NODE_ENV** — change `development` to `production`
2. **DATABASE_URL** — replace the values with your database info:
   ```
   DATABASE_URL=postgresql://vyaktrix_user:YourStrongPassword123@localhost:5432/vyaktrix
   ```
3. **JWT_SECRET** — delete `your-super-secret-jwt-key-change-in-production` and type a random string like `ksjdhfksjdhf2387423rhfkjsdhf`
4. **JWT_REFRESH_SECRET** — same thing, another random string
5. **FRONTEND_URL** — change to `https://yourdomain.com` (use your actual domain)

To save in nano:
- Press `Ctrl+X` (hold Control, press X)
- Press `Y` (to say yes, save changes)
- Press `Enter` (to confirm filename)

---

## STEP 9: Install backend dependencies and build

```
cd /var/www/vyaktrix/backend
npm install
```

This installs all the packages. Wait 1-3 minutes.

```
npm run build
```

This compiles the code. Wait 1-2 minutes. If you see errors, let me know.

---

## STEP 10: Install PM2 (keeps your app running)

```
npm install -g pm2
```

Start your backend:
```
pm2 start dist/index.js --name vyaktrix-backend
```

Save the process (so it restarts if the server reboots):
```
pm2 save
pm2 startup
```

After `pm2 startup`, it will show a command you need to run. Copy that command and paste it, then press Enter.

---

## STEP 11: Configure and build the frontend

Go to frontend folder:
```
cd /var/www/vyaktrix/frontend
```

Create the environment file:
```
nano .env.local
```

Add this line (replace with your domain):
```
NEXT_PUBLIC_API_URL=https://yourdomain.com/api
```

Save: `Ctrl+X`, `Y`, `Enter`.

Install dependencies:
```
npm install
```

Build the frontend:
```
npm run build
```

After building, you'll see a folder called `out/` — this contains the static website files.

---

## STEP 12: Set up Nginx (web server)

Create a config file:
```
nano /etc/nginx/sites-available/vyaktrix
```

Copy and paste this ENTIRE block (right-click to paste in PuTTY, or Shift+Insert):
```
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    root /var/www/vyaktrix/frontend/out;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /socket.io/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

**IMPORTANT:** Replace `yourdomain.com` with your actual domain!

Save: `Ctrl+X`, `Y`, `Enter`.

Now enable this config:
```
ln -s /etc/nginx/sites-available/vyaktrix /etc/nginx/sites-enabled/
```

Remove the default nginx page:
```
rm -f /etc/nginx/sites-enabled/default
```

Test the config:
```
nginx -t
```

If it says `test is successful`, reload nginx:
```
systemctl reload nginx
```

---

## STEP 13: Run database migrations

This creates all the tables in your database:
```
cd /var/www/vyaktrix/backend
npx drizzle-kit push:pg
```

If you get a connection error, make sure PostgreSQL is running:
```
systemctl status postgresql
```

---

## STEP 14: Set up SSL (HTTPS)

Replace `yourdomain.com` with your actual domain:
```
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Follow the prompts:
- Enter your email
- Agree to terms (type `A` then Enter)
- Choose whether to redirect HTTP to HTTPS (recommended: `2`)

---

## STEP 15: Test your website

Open your browser and go to:
```
https://yourdomain.com
```

You should see the Vyaktrix login page!

---

## If something goes wrong:

### Check if backend is running:
```
pm2 status
pm2 logs vyaktrix-backend
```

### Check if nginx is running:
```
systemctl status nginx
```

### Check if PostgreSQL is running:
```
systemctl status postgresql
```

### View nginx error logs:
```
tail -f /var/log/nginx/error.log
```

### View backend error logs:
```
pm2 logs vyaktrix-backend --lines 50
```

---

## Common beginner mistakes:

1. **Forgot to replace domain names** — Double-check you changed `yourdomain.com` everywhere
2. **Wrong database password** — Make sure the password in `.env` matches what you set in PostgreSQL
3. **Port 3001 already in use** — Run `kill $(lsof -t -i:3001)` then `pm2 start` again
4. **Nginx won't reload** — Run `nginx -t` to find the syntax error
5. **Firewall blocking** — Run `ufw allow 80` and `ufw allow 443` and `ufw allow 22`

---

Stuck? Tell me:
- What step number you're on
- The exact error message you see (copy-paste it)
