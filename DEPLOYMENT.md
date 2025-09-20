# Deployment Guide - Omni Folio Guard

This guide covers various deployment options for the Omni Folio Guard application.

## 🚀 Quick Deploy Options

### Vercel (Recommended for Frontend)

1. **Connect your repository**

   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will auto-detect it's a Vite React app

2. **Configure environment variables**

   ```env
   VITE_COVALENT_API_KEY=your_covalent_api_key
   VITE_ETHERSCAN_API_KEY=your_etherscan_api_key
   VITE_COINGECKO_API_KEY=your_coingecko_api_key
   ```

3. **Deploy**
   - Click "Deploy" and your app will be live in minutes
   - Automatic deployments on every push to main branch

### Netlify

1. **Build settings**

   - Build command: `npm run build`
   - Publish directory: `dist`

2. **Environment variables**

   - Add the same environment variables as Vercel

3. **Deploy**
   - Connect your repository and deploy

## 🐳 Docker Deployment

### Frontend Dockerfile

```dockerfile
# Frontend Dockerfile
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Backend Dockerfile

```dockerfile
# Backend Dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
EXPOSE 3001

CMD ["npm", "start"]
```

### Docker Compose

```yaml
version: "3.8"
services:
  frontend:
    build: .
    ports:
      - "80:80"
    environment:
      - VITE_API_BASE_URL=http://backend:3001/api
    depends_on:
      - backend

  backend:
    build: ./backend-example
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - PORT=3001
```

## ☁️ Cloud Provider Deployment

### AWS

#### Using AWS Amplify

1. Connect your GitHub repository
2. Configure build settings:
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm install
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: dist
       files:
         - "**/*"
   ```

#### Using EC2 + Docker

1. Launch EC2 instance
2. Install Docker and Docker Compose
3. Clone repository and run `docker-compose up -d`

### Google Cloud Platform

#### Using Cloud Run

1. Build and push Docker image:
   ```bash
   gcloud builds submit --tag gcr.io/PROJECT-ID/omni-folio-guard
   gcloud run deploy --image gcr.io/PROJECT-ID/omni-folio-guard --platform managed
   ```

### Azure

#### Using Azure Static Web Apps

1. Create Static Web App in Azure Portal
2. Connect GitHub repository
3. Configure build settings in `azure-static-web-apps.yml`

## 🔧 Production Configuration

### Environment Variables

Create a `.env.production` file:

```env
# API Configuration
VITE_API_BASE_URL=https://your-api-domain.com/api
VITE_COVALENT_API_KEY=your_production_covalent_key
VITE_ETHERSCAN_API_KEY=your_production_etherscan_key
VITE_COINGECKO_API_KEY=your_production_coingecko_key

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_DEFI_OPPORTUNITIES=true

# Performance
VITE_REFRESH_INTERVAL=30000
VITE_CACHE_DURATION=300000
```

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Handle client-side routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

## 🔒 Security Considerations

### API Security

- Use HTTPS in production
- Implement rate limiting
- Add CORS configuration
- Use environment variables for secrets
- Implement API key rotation

### Frontend Security

- Enable CSP (Content Security Policy)
- Use secure headers
- Validate all user inputs
- Implement proper error handling

## 📊 Monitoring & Analytics

### Application Monitoring

- **Sentry**: Error tracking and performance monitoring
- **Google Analytics**: User behavior analytics
- **LogRocket**: Session replay and debugging

### Performance Monitoring

- **Web Vitals**: Core web vitals tracking
- **Lighthouse**: Performance audits
- **Bundle Analyzer**: Bundle size optimization

## 🚀 CI/CD Pipeline

### GitHub Actions Example

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "18"
      - run: npm ci
      - run: npm run test
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: vercel/action@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 🔄 Database Setup (Optional)

For advanced features, you might want to add a database:

### PostgreSQL

```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_address VARCHAR(42) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- User preferences
CREATE TABLE user_preferences (
    user_id UUID REFERENCES users(id),
    currency VARCHAR(3) DEFAULT 'USD',
    refresh_interval INTEGER DEFAULT 30000,
    notifications JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Portfolio snapshots
CREATE TABLE portfolio_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    total_value DECIMAL(20,8),
    tokens JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);
```

## 📈 Scaling Considerations

### Frontend Scaling

- Use CDN for static assets
- Implement service workers for caching
- Optimize bundle size
- Use lazy loading for components

### Backend Scaling

- Use load balancers
- Implement caching (Redis)
- Use database connection pooling
- Implement rate limiting

## 🆘 Troubleshooting

### Common Issues

**Build fails**

- Check Node.js version (18+)
- Clear node_modules and reinstall
- Check environment variables

**API errors**

- Verify API keys are correct
- Check rate limits
- Ensure CORS is configured

**Performance issues**

- Enable gzip compression
- Optimize images
- Use CDN for static assets

### Support

- Check logs in your deployment platform
- Use browser dev tools for frontend issues
- Monitor API response times
- Check error tracking services

---

**Happy Deploying! 🚀**
