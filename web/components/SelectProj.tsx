import { Select } from "@mantine/core";
import { PROJECTIONS } from "../lib/api";

type ProjProps = {
    proj: string;
    setProj: (proj: string) => void;
};

export default function SelectProj({ proj, setProj }: ProjProps) {
    return (
        <Select
            label="projection"

            data={PROJECTIONS}
            value={proj}
            allowDeselect={false}
            onChange={(value) => value && setProj(value)}
        />
    );
}
