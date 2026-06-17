export default {
  content: ["./index.html","./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        surface : '#12121f',
        base    : '#0a0a14',
        border  : 'rgba(255,255,255,0.08)',
        muted   : '#475569',
      },
      fontFamily: {
        mono: ["'JetBrains Mono'", 'monospace'],
      },
    },
  },
  plugins: [],
}
