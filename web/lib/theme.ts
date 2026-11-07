import { createTheme, InputWrapper } from "@mantine/core";

// a clean white panel UI with a light font and near-square corners
export const theme = createTheme({
    primaryColor: "dark",
    autoContrast: true,
    fontFamily:
        'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
    defaultRadius: "xs",
    radius: { xs: "2px", sm: "3px" },
    cursorType: "pointer",
    components: {
        // labels in the same light weight as the rest of the page
        InputWrapper: InputWrapper.extend({ styles: { label: { fontWeight: 400 } } }),
    },
});
