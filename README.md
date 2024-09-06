# hotube

이 프로젝트는
Node.js, Typescript, express, sequelize로 구현하였으며,
Rest api 기반의 백엔드 프로젝트 입니다.

[ 개요 ]
동영상 스트리밍 웹 사이트를 벤치마킹한 프로젝트입니다.

[ 주요기능 ]
1. JWT 토큰으로 로그인을 구현하였습니다
2. 걔정생성시 자신의 채널이 생성되며, 다른 유저의 채널을 구독할 수 있습니다.
3. 동영상에 대한 댓글 및 대댓글을 작성할 수 있습니다.
4. 동영상 및 댓글에 대한 좋아요, 싫어요, 신고하기 기능이 있습니다.
5. 자신이 자주 시청한 동영상에 대한 알고리즘으로 동영상을 추천해줍니다.
6. 기타 프로필 및 동영상의 썸네일을 추출합니다.
7. 로그인을 하지 않았을 때 이메일 인증을 통해 비밀번호를 재설정 할 수 있습니다.
8. 동영상 등록시 에디터로 파일 업로드 및 글 등록시 html 관련 태그들을 파싱하여 저장합니다.

[ DataBase 정보] 
1. MySQL 8 사용
2. document 폴더내에 ERD가 업로드

[ Table 설명 ]
1. Attachment: 파일 업로드
2. Category: 동영상의 카테고리
3. Channel: 유저의 채널
4. Compalint: 동영상 및 댓글에 대한 신고
5. Content: 동영상 게시물
6. Recommend: 좋아요 및 싫어요
7. Reply: 댓글 및 대댓글
8. Subscribe: 구독중인 채널 및 구독자
9. User: 사용자
10. Watch: 시청한 동영상
11. VerificaionCode: 이메일 인증