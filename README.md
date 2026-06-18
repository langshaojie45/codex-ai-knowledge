# AI 配置知识库

这是一个静态网站，可以部署到 Vercel、Cloudflare Pages、GitHub Pages 或任意静态服务器。

## 本地预览

```bash
python -m http.server 4173
```

然后打开：

```text
http://127.0.0.1:4173
```

## Vercel 部署

```bash
npx vercel login
npx vercel --prod
```

首次部署会要求登录并创建项目。
