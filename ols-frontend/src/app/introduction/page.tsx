import Link from 'next/link';

function IntroductionPage() {
    return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
            <h1>저희 회사에 오신 것을 환영합니다!</h1>
            <p>혁신적인 솔루션으로 당신의 비즈니스를 지원합니다.</p>
            <div style={{ marginTop: '30px' }}>
                <Link href="/login" style={{ marginRight: '15px', padding: '10px 20px', backgroundColor: '#007bff', color: 'white', textDecoration: 'none', borderRadius: '5px' }}>
                    로그인
                </Link>
                <Link href="/signup" style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', textDecoration: 'none', borderRadius: '5px' }}>
                    회원가입
                </Link>
            </div>
            <p style={{ marginTop: '50px' }}>로그인 후에는 메인 대시보드로 이동합니다.</p>
        </div>
    );
}

export default IntroductionPage;