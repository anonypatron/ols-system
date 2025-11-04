import Link from "next/link";

function AdminPage() {
    return (
        <div>
            <div>
                admin panel
            </div>
            <div>
                <Link href="/admin/course/management">강의 관리하기</Link>
            </div>
        </div>
    )
}

export default AdminPage;