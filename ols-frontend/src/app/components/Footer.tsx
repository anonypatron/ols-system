import Link from "next/link";

function Footer() {
    return (
        <div style={{ padding: '20px', backgroundColor: '#eee', textAlign: 'center', marginTop: 'auto' }}>
            <div>
                <Link href="/">Home</Link> |
                <Link href="/about">About</Link> |
                <Link href="/contact">Contact</Link>
            </div>

            <div style={{marginTop: '10px'}}>
                <p>📞 010-1234-5678 | ✉️ contact@example.com</p>
                <p>© 2025 MyCompany Inc. All rights reserved.</p>
            </div>

            <div style={{marginTop: '10px'}}>
                <a href="https://facebook.com" target="_blank">Facebook</a> |
                <a href="https://instagram.com" target="_blank">Instagram</a>
            </div>
        </div>
    )
}

export default Footer;