# 한미그룹 채용 페이지 (React)

원본 채용 페이지를 Vite와 React(JavaScript)로 분리한 배포용 프로젝트입니다. 이미지와 CSS는 `public/`에, 페이지 컴포넌트와 원본 JSON 데이터는 `src/`에 있습니다. Canvas 캐릭터 플레이어는 `public/hanmi-reading-eye-tracking/`에 독립 자산으로 보존합니다.

## 개발

```powershell
npm install
npm run dev
```

## 배포 빌드 확인

```powershell
npm run build
npm run preview
```

배포 파일은 `dist/`에 생성됩니다. `vite.config.js`의 상대 경로 설정으로 하위 경로에 정적 배포할 수 있습니다.

지원하기 버튼의 실제 지원 URL이 아직 제공되지 않아 원본과 같이 `#` 상태입니다. 정해진 URL이 생기면 `src/components/StaticSections.jsx`와 관련 CTA 링크를 갱신하세요.
