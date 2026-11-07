const isDev = process.env.NODE_ENV === "development";

/** @type {import('next').NextConfig} */
module.exports = {
    reactStrictMode: true,
    turbopack: {
        root: __dirname,
    },
    images: {
        unoptimized: true,
    },
    // a static export in production; in dev, proxy the API (rewrites can't be exported)
    ...(isDev
        ? {
              async rewrites() {
                  return [
                      {
                          source: "/api/:path*",
                          destination: "http://localhost:8080/api/:path*",
                      },
                  ];
              },
          }
        : {
              output: "export",
          }),
};
