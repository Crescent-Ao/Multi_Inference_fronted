# 构建阶段
FROM node:18-alpine as build-stage

WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm

# 复制依赖文件
COPY package.json pnpm-lock.yaml ./

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY . .

# 构建应用
RUN pnpm build

# 检查构建输出
RUN ls -la dist/

# 生产环境
FROM nginx:alpine as production-stage

# 复制构建产物
COPY --from=build-stage /app/dist /usr/share/nginx/html

# 复制 nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 检查文件是否正确复制
RUN ls -la /usr/share/nginx/html

# 添加调试信息
RUN cat /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"] 
