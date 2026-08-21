/** @type {import('tailwindcss').Config} */
module.exports = {
  // 1. Tailwind가 적용될 파일 경로 설정 (src 폴더 내 모든 js, jsx, ts, tsx 파일)
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      // 2. 프로젝트 전용 커스텀 디자인(색상, 폰트 등)이 필요하면 여기에 추가
    },
  },
  plugins: [],
}