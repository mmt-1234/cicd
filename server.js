const app = require('./app');
// 시스템 환경 변수에서 포트를 읽어오거나 기본값 3000을 사용
const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0' ,() => {
    console.log(`Production Server is continuously running on port ${PORT}`);
});