import React, { useCallback, useRef, useState } from "react";
import { HexColorPicker } from "react-colorful";

import useClickOutside from "../hooks/useClickOutside";

export default function PopoverPicker({ color, onChange, title }) {
    const popover = useRef();
    const [isOpen, toggle] = useState(false);

    const close = useCallback(() => toggle(false), []);
    useClickOutside(popover, close);

    return (
        <div className="relative p-2 flex flex-row items-center justify-end">
            <p className="pr-2 font-light">{title}</p>
            <div
                className="w-8 h-8 border border-black"
                style={{ backgroundColor: color }}
                onClick={() => toggle(true)}
            />

            {isOpen && (
                <div className="absolute" ref={popover}>
                    <HexColorPicker color={color} onChange={onChange} />
                </div>
            )}
        </div>
    );
}
