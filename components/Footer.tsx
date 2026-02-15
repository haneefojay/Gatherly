
import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-white dark:bg-[#15192b] border-t border-slate-200 dark:border-slate-800 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="text-center md:text-left">
                    <span className="text-primary font-bold text-xl tracking-tighter">EventFlow</span>
                    <p className="text-sm text-slate-500 mt-1">Connecting people through experiences.</p>
                </div>
                <div className="flex gap-6 text-sm text-slate-500 font-medium">
                    <Link href="#" className="hover:text-primary transition-colors">About</Link>
                    <Link href="#" className="hover:text-primary transition-colors">Privacy</Link>
                    <Link href="#" className="hover:text-primary transition-colors">Terms</Link>
                    <Link href="#" className="hover:text-primary transition-colors">Support</Link>
                </div>
                <div className="text-sm text-slate-400">
                    © {new Date().getFullYear()} EventFlow Inc.
                </div>
            </div>
        </footer>
    );
}
