import { FiGithub } from "react-icons/fi";

export default function Footer() {
    return (
        <footer className="mt-10 flex w-full flex-row items-center justify-between border-t-2 border-gray-100 bg-white px-8 py-3 pb-4 text-sm font-light md:mt-20">
            <p>&copy; {new Date().getFullYear()} Samila</p>
            <a href="https://github.com/evanofslack/samila-ui" aria-label="source on GitHub">
                <FiGithub size="1.2rem" />
            </a>
        </footer>
    );
}
