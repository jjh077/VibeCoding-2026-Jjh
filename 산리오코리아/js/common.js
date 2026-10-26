// common.js : 모든 페이지 공통 기능 (햄버거 메뉴)

// 자바스크립트 월드에 오신것을 환영합니다!
console.log('안뇽!');

/////////////// 햄버거버튼 클릭시 메뉴 보이기/숨기기 ///////////////
// 1. 대상선정
// 1-1. 이벤트 대상 : 햄버거버튼(.menu-btn)
let 햄버거 = document.querySelector('.menu-btn');

// 1-2. 변경대상 : 상단영역(#site-header)
let 상단박스 = document.querySelector('#site-header');

// 2. 이벤트 함수 만들기
// 햄버거나 상단박스가 없는 페이지에서는 실행하지 않도록 확인함!
if (햄버거 && 상단박스) {
  // 햄버거 클릭시 상단박스 클래스 on 넣기
  햄버거.onclick = () => {
    상단박스.classList.toggle('on');
    // classlist 객체는 클래스를 넣고 빼는 기능을 가짐
    // add(클래스명) - 클래스넣기
    // remove(클래스명) - 클래스뺴기
    // toggle(클래스명) - 클래스넣기/빼기 전환
  }; //////// 클릭함수 ///////////
} //// if ////

  console.log('선택확인:', 햄버거, 상단박스);
