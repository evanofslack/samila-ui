import { ActionIcon, Tooltip } from "@mantine/core";
import { FiShuffle } from "react-icons/fi";

type randomizerProps = {
    setEq: React.Dispatch<React.SetStateAction<number>>;
    setProj: React.Dispatch<React.SetStateAction<string>>;
    setLine: React.Dispatch<React.SetStateAction<string>>;
    setBg: React.Dispatch<React.SetStateAction<string>>;
    setSpot: React.Dispatch<React.SetStateAction<number>>;
};

export default function Randomizer(props: randomizerProps) {
    function randomize() {
        props.setEq(2);
        props.setProj("polar");
        props.setLine("ffffff");
        props.setBg("000000");
        props.setSpot(69);
    }

    return (
        <div>
            <Tooltip label="shuffle" withArrow className="px-1">
                <ActionIcon color="black" onClick={() => randomize()}>
                    <FiShuffle size="1.2rem" />
                </ActionIcon>
            </Tooltip>
        </div>
    );
}
