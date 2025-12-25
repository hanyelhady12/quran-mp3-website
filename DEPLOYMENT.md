# Quran MP3 Website - Deployment Guide

## 🎯 Website Overview

This is a complete Quran MP3 player website with:
- **Full MP3 Playback**: Listen to all ayahs (verses) from all 114 surahs
- **8 Renowned Reciters**: Including Mishary Rashid Alafasy, Al-Husary, Minshawi, and more
- **Beautiful Nature Background**: Serene and spiritual atmosphere
- **Modern UI/UX**: Responsive design with smooth animations
- **Advanced Player Features**: Play/pause, next/previous, repeat, volume control, and ayah navigation

---

## 🚀 Quick Start (Development)

### 1. Install Dependencies
```bash
cd /home/z/my-project
bun install
```

### 2. Start Development Server
```bash
bun run dev
```

The website will be available at: `http://localhost:3000`

---

## 📦 Deployment Options

### Option 1: Vercel (Recommended) ⭐

**Why Vercel?**
- Built by the creators of Next.js
- Zero configuration
- Automatic HTTPS
- Global CDN
- Free tier available

#### Steps:

1. **Create a Vercel Account**
   - Visit: https://vercel.com/signup
   - Sign up with GitHub, GitLab, or Email

2. **Install Vercel CLI**
   ```bash
   bun install -g vercel
   ```

3. **Login to Vercel**
   ```bash
   vercel login
   ```

4. **Deploy**
   ```bash
   cd /home/z/my-project
   vercel
   ```

   Follow the prompts:
   - Set up and deploy? → **Yes**
   - Which scope? → Select your account
   - Link to existing project? → **No**
   - Project name? → `quran-mp3` (or your preferred name)
   - In which directory is your code? → Press Enter (current directory)
   - Want to modify settings? → **No**

5. **Production Deployment**
   ```bash
   vercel --prod
   ```

Your website will be live at: `https://your-project-name.vercel.app`

---

### Option 2: Netlify

#### Steps:

1. **Create a Netlify Account**
   - Visit: https://app.netlify.com/signup

2. **Build the Project**
   ```bash
   cd /home/z/my-project
   bun run build
   ```

3. **Deploy**
   ```bash
   bun install -g netlify-cli
   netlify login
   netlify deploy --prod --dir=.next
   ```

---

### Option 3: Self-Hosted (VPS/Dedicated Server)

#### Prerequisites:
- A VPS or dedicated server (DigitalOcean, AWS EC2, Linode, etc.)
- Node.js 18+ installed
- Nginx or Apache web server

#### Steps:

1. **Install Node.js on your server**
   ```bash
   # For Ubuntu/Debian
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # Install bun
   curl -fsSL https://bun.sh/install | bash
   ```

2. **Clone or upload your project**
   ```bash
   # Using git
   git clone <your-repo-url> /var/www/quran-mp3
   cd /var/www/quran-mp3

   # Or upload via FTP/SFTP
   ```

3. **Install dependencies**
   ```bash
   bun install
   ```

4. **Build the project**
   ```bash
   bun run build
   ```

5. **Start the production server**
   ```bash
   bun start
   ```

6. **Set up with PM2 (for process management)**
   ```bash
   bun install -g pm2
   pm2 start bun --name "quran-mp3" -- start
   pm2 save
   pm2 startup
   ```

7. **Configure Nginx**
   Create `/etc/nginx/sites-available/quran-mp3`:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   Enable the site:
   ```bash
   sudo ln -s /etc/nginx/sites-available/quran-mp3 /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

8. **Add SSL (Let's Encrypt)**
   ```bash
   sudo apt-get install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

---

### Option 4: Docker

1. **Create Dockerfile** (create in project root):
   ```dockerfile
   FROM node:18-alpine AS base

   # Install dependencies only when needed
   FROM base AS deps
   RUN apk add --no-cache libc6-compat
   WORKDIR /app

   COPY package.json bun.lockb* ./
   RUN npm install -g bun
   RUN bun install

   # Rebuild the source code only when needed
   FROM base AS builder
   WORKDIR /app
   COPY --from=deps /app/node_modules ./node_modules
   COPY . .

   RUN npm install -g bun
   RUN bun run build

   # Production image
   FROM base AS runner
   WORKDIR /app

   ENV NODE_ENV production

   RUN addgroup --system --gid 1001 nodejs
   RUN adduser --system --uid 1001 nextjs

   COPY --from=builder /app/public ./public
   COPY --from=builder /app/.next/standalone ./
   COPY --from=builder /app/.next/static ./.next/static

   USER nextjs

   EXPOSE 3000

   ENV PORT 3000
   ENV HOSTNAME "0.0.0.0"

   CMD ["node", "server.js"]
   ```

2. **Update next.config.ts** (add output: 'standalone'):
   ```typescript
   const nextConfig = {
     output: 'standalone',
   }
   ```

3. **Build and run Docker container**
   ```bash
   docker build -t quran-mp3 .
   docker run -p 3000:3000 quran-mp3
   ```

---

## 🔧 Environment Variables

Create a `.env` file in the root directory (if needed):
```env
# Add your environment variables here
# Currently no variables are required for this project
```

---

## 📁 Project Structure

```
quran-mp3/
├── public/
│   └── quran-bg.jpg          # Nature background image
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── quran/
│   │   │       └── surahs/
│   │   │           └── route.ts    # API endpoint for surahs
│   │   ├── globals.css          # Global styles
│   │   ├── layout.tsx           # Root layout
│   │   └── page.tsx             # Main page (Quran player)
│   ├── components/
│   │   └── ui/                  # shadcn/ui components
│   ├── lib/
│   │   ├── db.ts               # Database utilities
│   │   └── utils.ts            # Utility functions
│   └── hooks/                   # React hooks
├── prisma/
│   └── schema.prisma           # Database schema
├── package.json                # Dependencies
├── tsconfig.json               # TypeScript config
└── next.config.ts              # Next.js config
```

---

## 🎨 Customization

### Changing the Background Image

1. Replace `/home/z/my-project/public/quran-bg.jpg` with your own image
2. The image will be automatically picked up by the website

### Adding More Reciters

Edit `/home/z/my-project/src/app/page.tsx` and add to the `reciters` array:

```typescript
const reciters: Reciter[] = [
  // ... existing reciters
  {
    id: 'new.reciter.id',
    name: 'Reciter Name',
    url: 'https://audio-url-base.com/path'
  },
]
```

### Changing Colors

Edit the Tailwind CSS classes in `/home/z/my-project/src/app/page.tsx`:
- Primary colors: `emerald-500`, `emerald-600`, `emerald-700`
- Secondary colors: `teal-600`, `teal-700`

---

## 🌐 Domain Configuration

### For Vercel:

1. Go to your project settings in Vercel
2. Click on "Domains"
3. Add your custom domain
4. Update your DNS records as instructed

### For Self-Hosted:

Update Nginx config with your domain:
```nginx
server_name your-domain.com www.your-domain.com;
```

---

## 🔒 Security Considerations

1. **HTTPS is mandatory for production** - Use Let's Encrypt or your provider's SSL
2. **API rate limiting** - Consider implementing rate limiting for API routes
3. **CORS configuration** - Configure if you need to allow cross-origin requests
4. **Content Security Policy** - Add CSP headers in your web server config

---

## 📊 Performance Tips

1. **Enable caching** - Configure CDN caching for static assets
2. **Optimize images** - Use Next.js Image component for images
3. **Enable compression** - Enable gzip/brotli compression in Nginx
4. **Monitor performance** - Use Vercel Analytics or similar tools

---

## 🐛 Troubleshooting

### Issue: Audio not playing
**Solution:** Check browser console for errors. Ensure audio URLs are accessible.

### Issue: Images not loading
**Solution:** Verify the background image exists in `/public` folder.

### Issue: Build fails
**Solution:** Run `bun run lint` to check for errors, then fix any issues.

### Issue: API returning 404
**Solution:** Ensure API routes exist in `/src/app/api` directory structure.

---

## 📞 Support

For issues related to:
- **Next.js**: https://nextjs.org/docs
- **Vercel**: https://vercel.com/docs
- **Bun**: https://bun.sh/docs

---

## 📄 License

This project is open source and can be freely used and modified.

---

## 🙏 Acknowledgments

- Quran data API: https://alquran.cloud
- Audio files: EveryAyah.com
- UI Components: shadcn/ui
- Framework: Next.js

---

## 🎉 You're Ready to Go!

Your Quran MP3 website is now fully functional and ready to deploy. Choose your preferred deployment method above and share the beautiful recitations with the world! 🌍
