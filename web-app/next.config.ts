const nextConfig = {
  transpilePackages: ['tailwindcss'], // Add this if needed
  // experimental: {
  //   turbo: {
  //     root: '.',
  //   },
  // },
  devIndicators: {
    buildActivity: false,
    appIsrStatus: false,
  },
};

export default nextConfig;