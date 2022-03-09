import { AiOutlineMenu } from "react-icons/ai";
import { useState } from "react";
import { GrClose } from "react-icons/gr";
import Footer from "./Footer";
import { useScrollLock } from "@mantine/hooks";

export default function MobileNav() {
    const [isOpen, setIsOpen] = useState(false);
    const [scrollLocked, setScrollLocked] = useScrollLock();
    const toggle = () => {
        setIsOpen((value) => !value);
        setScrollLocked((c) => !c);
    };

    return (
        <div>
            <nav className="flex flex-row items-center justify-between py-3 px-8 w-full bg-white drop-shadow">
                <h1 className="text-3xl font-semibold">Samila</h1>
                {!isOpen && <AiOutlineMenu size="1.8rem" onClick={toggle} />}
                {isOpen && <GrClose size="1.5rem" onClick={toggle} />}
            </nav>
            {isOpen && (
                <div className="bg-gray-50 w-screen h-screen z-10 mt-1">
                    <div className="w-full flex items-center justify-center pt-12 flex-grow">
                        <div className="flex flex-col items-start p-4 lg:p-12 font-light m-12 max-w-xl bg-white shadow-sm">
                            <p className="pb-4">
                                <a
                                    href="https://github.com/sepandhaghighi/samila"
                                    className="underline"
                                >
                                    Samila
                                </a>
                                &nbsp;is a python library for creating generative art.
                            </p>
                            <p className="pb-4">
                                Applying mathematical equations to thousands of psuedo-random
                                points, Samila creates unique geometric patterns.
                            </p>
                            <p className="pb-4">
                                Each generation has an associated seed that can be used for
                                identification and replication.
                            </p>
                        </div>
                    </div>
                    <footer className="fixed bottom-0 right-0">
                        <Footer />
                    </footer>
                </div>
            )}
        </div>
    );
}
