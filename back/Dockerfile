FROM node:20-alpine AS production

# Security: Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs

WORKDIR /app

COPY package.json package-lock.json tsconfig.json ./
COPY node_modules ./node_modules
COPY dist ./dist

RUN mkdir -p /app/logs /app/media && chown -R nodejs:nodejs /app

USER nodejs

EXPOSE ${PORT:-3000}

# Health check (uses PORT env var, defaults to 3000)
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 3000) + '/api/chatbot/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))" || exit 1

# Run the application
CMD ["node", "dist/main"]
