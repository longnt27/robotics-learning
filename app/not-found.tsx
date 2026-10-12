import Link from "next/link";
import { ArrowUpRight, Orbit } from "lucide-react";
export default function NotFound() { return <main className="notfound"><Orbit size={52}/><p className="mono-label">KHÔNG TÌM THẤY / 404</p><h1>Không tìm thấy bài nghiên cứu.</h1><p>Đường dẫn này chưa tồn tại trong bản đồ tri thức.</p><Link href="/" className="button button-primary">Quay lại Atlas <ArrowUpRight size={16}/></Link></main>; }
