import { ActionIcon, CopyButton, Tooltip } from "@mantine/core";
import { ReactNode } from "react";
import { FiCheck } from "react-icons/fi";

type CopyIconProps = {
    value: string;
    label: string;
    icon: ReactNode;
};

// an icon button that copies a value, confirming in its tooltip
export default function CopyIcon({ value, label, icon }: CopyIconProps) {
    return (
        <CopyButton value={value} timeout={1500}>
            {({ copied, copy }) => (
                <Tooltip label={copied ? "copied" : label} withArrow>
                    <ActionIcon variant="subtle" color="dark" aria-label={label} onClick={copy}>
                        {copied ? <FiCheck size="1.1rem" /> : icon}
                    </ActionIcon>
                </Tooltip>
            )}
        </CopyButton>
    );
}
