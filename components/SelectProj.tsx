import React from "react";
import Select from "react-select";

type ProjProps = {
    proj: string;
    setProj: React.Dispatch<React.SetStateAction<String>>;
};

const opts = [
    { value: "rectilinear", label: "rectilinear" },
    { value: "polar", label: "polar" },
    { value: "hammer", label: "hammer" },
];

export default function SelectProj({ proj, setProj }: ProjProps) {
    function handleSelect(option: any) {
        setProj(option.value);
    }

    return (
        <div className="pt-2">
            <p className="font-light">projection</p>
            <Select
                className="font-light"
                defaultValue={proj}
                placeholder={proj}
                onChange={handleSelect}
                options={opts}
            />
        </div>
    );
}
