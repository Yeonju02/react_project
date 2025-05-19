# 👩 개인 프로젝트 - React

![image](https://github.com/user-attachments/assets/ff6fea2f-7102-4ef2-9407-07d94975b190)

---

## 💡 프로젝트 소개

- React와 Node.js를 활용한 SNS 웹 애플리케이션입니다
- 게시글 작성, 좋아요, 댓글, DM, 알림 등 인스타그램 주요 기능을 구현했습니다

---

## 🗓 개발 기간

- **시작일**: 2025.05.08  
- **종료일**: 2025.05.19 (계속 고쳐나갈 예정)  
- **총 개발 기간**: 약 10일  

---

## 🛠️ 사용 언어 & 기술 스택

| 구분 | 기술 |
|------|------|
| Frontend | ![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black) ![MUI](https://img.shields.io/badge/MUI-007FFF?style=for-the-badge&logo=mui&logoColor=white) ![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge) ![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white) |
| Backend | ![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white) ![Express](https://img.shields.io/badge/Express-FF4F4F?style=for-the-badge&logo=express&logoColor=white) |
| Database | ![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white) (HeidiSQL 사용) |
| 기타 | ![Multer](https://img.shields.io/badge/Multer-FF8C00?style=for-the-badge) ![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?style=for-the-badge&logo=socketdotio&logoColor=white) |

---

## 📄 페이지별 주요 기능

### 🔐 로그인 / 회원가입

![image](https://github.com/user-attachments/assets/f467dcfa-ff7a-40de-abc0-26e84e36f2c0)
![image](https://github.com/user-attachments/assets/6e95f3fe-de2e-42dc-aacb-9cacfe2915e2)

- JWT를 이용한 인증 및 토큰 저장
- 로그인 실패 시 에러 메시지 출력

--

### 🏠 메인 피드

![image](https://github.com/user-attachments/assets/f07d7c2d-1a1a-4618-8636-207df1d2c6bf)

- 게시글 목록 조회 (이미지 여러 장 포함)
- 좋아요, 댓글, 저장, 공유 기능
- 해시태그, 사용자 태그 기능

### 📝 게시글 작성

![image](https://github.com/user-attachments/assets/13d9a20e-fec0-4bba-871a-46ac393dd020)
![image](https://github.com/user-attachments/assets/76146f2b-fe79-4a4c-a8e0-a19199c24cae)
![image](https://github.com/user-attachments/assets/8eaac756-9924-4f18-8272-a7e97ee22e74)

- 이미지 다중 업로드 & 크롭 기능
- 이미지 없이 내용으로만 업로드 가능
- 사용자 태그 & 해시태그 등록

### 💬 댓글 / 대댓글

![image](https://github.com/user-attachments/assets/a2a3cbfa-1818-4526-9f0f-67431890ce51)

- 실시간 등록 및 삭제
- 대댓글 펼치기/숨기기
- 좋아요 기능 포함

### 📬 DM (Direct Message)

![image](https://github.com/user-attachments/assets/499da885-d191-4d34-beb3-5d0b8b64510c)

- 실시간 채팅 (Socket.IO)
- 채팅방 목록, 새 대화 생성
- 게시글 공유 기능

### 🔔 알림

![image](https://github.com/user-attachments/assets/8e4aafad-db39-4d8c-8f34-3568ec8412e7)

- 팔로우, 좋아요, 댓글, 언급 시 실시간 알림

### 🔎 검색

![image](https://github.com/user-attachments/assets/7d561a1d-d44c-498b-9a27-39487739543b)
![image](https://github.com/user-attachments/assets/d766b0c2-381b-464c-926e-4422f3ebf518)

- '게시글', '사용자' 탭으로 구분하여 검색 가능  
- 검색 중에는 로딩 인디케이터 표시  

### 👤 마이페이지

![image](https://github.com/user-attachments/assets/a880cd8f-99c1-4bd1-b3d0-643a82778c7f)
![image](https://github.com/user-attachments/assets/14488dfe-746e-49d8-ab8c-71591cb2681f)
![image](https://github.com/user-attachments/assets/8eda00fd-6c65-4d1e-914b-06a3c3266769)
![image](https://github.com/user-attachments/assets/38badea8-a447-4d41-98e1-282922c29e0f)

- 내가 쓴 글, 저장한 글, 태그된 게시글 보기
- 팔로우 / 팔로잉 목록 확인
- 프로필 편집 기능

---

## 💬 프로젝트 후기

이번 프로젝트를 통해 React와 Node.js를 활용한 **전체적인 웹 서비스 개발 흐름**을 알 수 있었습니다.  
특히 실시간 채팅과 알림 시스템 구현은 처음이었기에 많은 도전이 되었고, 사용자 중심 UI/UX 구성의 중요성도 크게 느꼈습니다.  
