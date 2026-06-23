# build
FROM node:20-alpine AS build
WORKDIR /app
ARG VCS_REF=unknown
ARG COMMIT_DATE=unknown
ARG BUILD_RUN=local
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ENV VITE_BUILD_GIT_SHA=$VCS_REF
ENV VITE_BUILD_COMMIT_DATE=$COMMIT_DATE
ENV VITE_BUILD_RUN=$BUILD_RUN
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
# serve
FROM nginx:alpine
ARG VCS_REF=unknown
ARG COMMIT_DATE=unknown
ARG BUILD_RUN=local
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
RUN printf '{"git_sha":"%s","commit_date":"%s","build_run":"%s"}\n' "$VCS_REF" "$COMMIT_DATE" "$BUILD_RUN" > /usr/share/nginx/html/version.json
EXPOSE 80
