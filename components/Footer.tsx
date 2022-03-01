import { FiGithub } from "react-icons/fi";

export default function Footer() {
    return (
        <footer className="fixed text-sm font-light bottom-0 left-0 flex flex-row justify-between w-screen p-6 pb-4 pt-10">
            <p> &copy; 2022 Samila </p>
            <a href="https://github.com/evanofslack/samila-ui">
                <FiGithub size="1.2rem" />
            </a>
        </footer>
    );
}
