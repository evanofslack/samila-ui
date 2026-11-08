import { FiGithub } from "react-icons/fi";

export default function Footer() {
    return (
        <footer className="mt-24 text-sm text-muted">
            <div className="mx-auto flex max-w-7xl flex-row flex-wrap items-center justify-between gap-4 px-4 py-8 sm:px-6">
                <p>
                    built on{" "}
                    <a
                        href="https://github.com/sepandhaghighi/samila"
                        className="underline underline-offset-2 transition-opacity hover:opacity-60"
                    >
                        samila
                    </a>
                </p>
                <div className="flex items-center gap-5">
                    <a href="/api/docs" className="transition-opacity hover:opacity-60">
                        api
                    </a>
                    <a
                        href="https://github.com/evanofslack/samila-ui"
                        aria-label="source on GitHub"
                        className="transition-opacity hover:opacity-60"
                    >
                        <FiGithub size="1.1rem" />
                    </a>
                </div>
            </div>
        </footer>
    );
}
