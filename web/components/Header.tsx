import { ReactNode } from "react";
import { useWindowScroll } from "@mantine/hooks";
import { FiCode, FiGithub, FiGrid, FiInfo } from "react-icons/fi";
import ThemeToggle from "./ThemeToggle";

type NavLinkProps = {
    href: string;
    label: string;
    icon: ReactNode;
};

// text from sm up, an icon on phones
function NavLink({ href, label, icon }: NavLinkProps) {
    return (
        <a
            href={href}
            aria-label={label}
            className="flex h-9 items-center rounded-sm px-2 text-sm text-muted transition-colors hover:text-ink"
        >
            <span className="hidden sm:inline">{label}</span>
            <span className="sm:hidden" aria-hidden>
                {icon}
            </span>
        </a>
    );
}

export default function Header() {
    const [scroll] = useWindowScroll();
    const scrolled = scroll.y > 4;

    return (
        <header
            className={`sticky top-0 z-30 h-14 border-b bg-bg/80 backdrop-blur-md transition-colors ${
                scrolled ? "border-line" : "border-transparent"
            }`}
        >
            <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6">
                <a href="/" className="text-xl font-bold tracking-tight">
                    samila
                </a>
                <nav aria-label="main" className="flex items-center gap-0.5 sm:gap-2">
                    <NavLink href="#how-it-works" label="about" icon={<FiInfo size="1.1rem" />} />
                    <NavLink href="#gallery" label="gallery" icon={<FiGrid size="1.1rem" />} />
                    <NavLink href="/api/docs" label="api" icon={<FiCode size="1.1rem" />} />
                    <a
                        href="https://github.com/evanofslack/samila-ui"
                        aria-label="source on GitHub"
                        className="flex h-9 items-center px-2 text-muted transition-colors hover:text-ink"
                    >
                        <FiGithub size="1.1rem" />
                    </a>
                    <ThemeToggle />
                </nav>
            </div>
        </header>
    );
}
