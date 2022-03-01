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
            <AiOutlineMenu size="1.8rem" onClick={toggle} className="mr-8" />
            {isOpen && (
                <div className="fixed top-0 left-0 bg-gray-100 w-screen h-full z-10">
                    <nav className="flex flex-row items-center justify-between pt-5 pr-9 pl-8 w-full">
                        <h1 className="text-3xl font-semibold ">Samila</h1>
                        <GrClose size="1.5rem" onClick={toggle} />
                    </nav>
                    <div className="w-full flex items-center justify-center ">
                        <div className="flex flex-col items-start pt-24 font-light m-12 max-w-xl">
                            <p className="pb-4">
                                <a
                                    href="https://github.com/sepandhaghighi/samila"
                                    className="underline"
                                >
                                    Samila
                                </a>
                                &nbsp;is a python library that creates generative art.
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
                    <Footer />
                </div>
            )}
        </div>
    );
}
