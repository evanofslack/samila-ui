import { AiOutlineMenu } from "react-icons/ai";
import { useState } from "react";
import { BiTimeFive } from "react-icons/bi";
import { BiCheck } from "react-icons/bi";
import { GrClose } from "react-icons/gr";
import { FiGithub } from "react-icons/fi";

export default function MobileNav() {
    const [isOpen, setIsOpen] = useState(false);
    const toggle = () => setIsOpen((value) => !value);

    return (
        <div>
            <AiOutlineMenu size="1.8rem" onClick={toggle} className="mr-8" />
            {isOpen && (
                <div className="fixed top-0 left-0 bg-gray-100 w-screen h-screen z-10">
                    <nav className="flex flex-row items-center justify-end pt-6 pr-9 w-full">
                        <GrClose size="1.5rem" onClick={toggle} />
                    </nav>
                    <div className="flex flex-col items-center pt-24 font-light m-12">
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
                            Applying mathematical equations to thousands of psuedo-random points,
                            Samila creates unique geometric patterns.
                        </p>
                        <p className="pb-4">
                            Each generation has an associated seed that can be used for
                            identification and replication.
                        </p>
                    </div>

                    <div className="text-sm font-light fixed bottom-0 left-0 flex flex-row items-center justify-between w-screen p-10">
                        <p> &copy; 2022 Samila </p>
                        <a href="https://github.com/evanofslack/samila-ui">
                            <FiGithub size="1.2rem" />
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
}
