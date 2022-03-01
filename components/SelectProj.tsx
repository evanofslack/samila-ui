import React from "react";
import { Select } from "@mantine/core";

type ProjProps = {
    proj: string;
    setProj: React.Dispatch<React.SetStateAction<string>>;
};

const opts = [
    { value: "rectilinear", label: "rectilinear" },
    { value: "polar", label: "polar" },
    { value: "hammer", label: "hammer" },
];

export default function SelectProj({ proj, setProj }: ProjProps) {
    return (
        <div className="pt-2">
            <p className="font-light">projection</p>
            <Select data={opts} defaultValue={proj} />
        </div>
    );
}
