// Cloudflare Pages Functions router for static assets
// Strategy: If the path has no extension and no trailing slash,
// try, in order: `/path/`, `/path.html`, `/path/index.html`.
// Otherwise, fall back to the static asset as-is.

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const hasExt = url.pathname.includes('.');
    const endsWithSlash = url.pathname.endsWith('/');

    // Helper to try a candidate path while preserving method/headers/query.
    const tryFetch = async (pathname) => {
      const candidate = new URL(pathname, url);
      // 保留原请求的所有属性（含查询串、头、方法等）
      const req = new Request(candidate, request);
      const res = await env.ASSETS.fetch(req);
      return res.status === 404 ? null : res;
    };

    // 对“无扩展名且不以 / 结尾”的路径执行自动路由
    if (!hasExt && !endsWithSlash) {
      const candidates = [
        url.pathname + '/',            // 目录式（/path/ -> /path/index.html）
        url.pathname + '.html',        // 单文件（/path -> /path.html）
        url.pathname + '/index.html',  // 显式 index.html
      ];
      for (const p of candidates) {
        const hit = await tryFetch(p);
        if (hit) {
          // 可选：如果命中的是 "/path/"，做 301 规范化到带斜杠（更利于 SEO）
          if (p.endsWith('/')) {
            const canonical = new URL(p + url.search, url.origin);
            return Response.redirect(canonical, 301);
          }
          return hit;
        }
      }
    }

    // 对“无扩展名但以 / 结尾”的目录路径，尝试 index.html（例如 /foo/）
    if (!hasExt && endsWithSlash) {
      const hit = await env.ASSETS.fetch(new Request(new URL(url.pathname + 'index.html', url), request));
      if (hit.status !== 404) return hit;
    }

    // 其它情况按原样走静态资源
    return env.ASSETS.fetch(request);
  }
};