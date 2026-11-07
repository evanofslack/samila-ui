import { ActionIcon, useComputedColorScheme, useMantineColorScheme } from "@mantine/core";
import { FiMoon, FiSun } from "react-icons/fi";

// both icons render and mantine's css hides one, so the markup never depends on the scheme
export default function ThemeToggle() {
    const { setColorScheme } = useMantineColorScheme();
    const computed = useComputedColorScheme("light", { getInitialValueInEffect: true });

    return (
        <ActionIcon
            variant="subtle"
            size="lg"
            aria-label="toggle dark mode"
            onClick={() => setColorScheme(computed === "dark" ? "light" : "dark")}
        >
            <FiMoon size="1.1rem" className="mantine-dark-hidden" />
            <FiSun size="1.1rem" className="mantine-light-hidden" />
        </ActionIcon>
    );
}
