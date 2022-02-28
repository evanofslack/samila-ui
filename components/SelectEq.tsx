import React from "react";
import Select from "react-select";

type EqProps = {
    eq: number;
    setEq: React.Dispatch<React.SetStateAction<Number>>;
};

const opts = [
    { value: 1, label: "1" },
    { value: 2, label: "2" },
    { value: 3, label: "3" },
    { value: 4, label: "4" },
    { value: 5, label: "5" },
    { value: 6, label: "6" },
    { value: 7, label: "7" },
    { value: 8, label: "8" },
    { value: 9, label: "9" },
];

export default function SelectEq({ eq, setEq }: EqProps) {
    function handleSelect(option: any) {
        setEq(option.value);
    }

    return (
        <div className="pt-2">
            <p className="font-light">variation</p>
            <Select
                className="font-light"
                defaultValue={eq}
                placeholder={eq}
                onChange={handleSelect}
                options={opts}
            />
        </div>
    );
}
