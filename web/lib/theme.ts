import {
    createTheme,
    CSSVariablesResolver,
    defaultVariantColorsResolver,
    InputWrapper,
    MantineColorsTuple,
    VariantColorsResolver,
} from "@mantine/core";

// near-white to near-black; buttons use the darkest shade in light mode and the
// lightest in dark mode, so the primary colour is always the page's ink
const ink: MantineColorsTuple = [
    "#e8e9ee",
    "#d2d4dc",
    "#b4b8c4",
    "#8b90a0",
    "#6b6f76",
    "#4b5060",
    "#333847",
    "#232a3d",
    "#1b1f2a",
    "#16181d",
];

// mantine's dark surfaces, shifted to the midnight blue of the gallery
const dark: MantineColorsTuple = [
    "#e8e9ee",
    "#c4c7d1",
    "#8b90a0",
    "#6b7080",
    "#343d55",
    "#232a3d",
    "#161c2d",
    "#0b0f1a",
    "#080b14",
    "#05070d",
];

// filled ink flips between dark and light with the scheme, so its text has to as well
const variantColorResolver: VariantColorsResolver = (input) => {
    const colors = defaultVariantColorsResolver(input);
    const color = input.color ?? input.theme.primaryColor;
    if (input.variant === "filled" && color === "ink") {
        return { ...colors, color: "var(--mantine-primary-color-contrast)" };
    }
    return colors;
};

export const theme = createTheme({
    variantColorResolver,
    colors: { ink, dark },
    primaryColor: "ink",
    primaryShade: { light: 9, dark: 0 },
    autoContrast: true,
    fontFamily:
        'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif, "Apple Color Emoji", "Segoe UI Emoji"',
    fontFamilyMonospace:
        'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
    headings: { fontWeight: "650" },
    defaultRadius: "sm",
    radius: { xs: "2px", sm: "4px", md: "6px" },
    cursorType: "pointer",
    components: {
        InputWrapper: InputWrapper.extend({ styles: { label: { fontWeight: 500 } } }),
    },
});

// the page background is paper or midnight rather than mantine's white or grey
export const cssVariablesResolver: CSSVariablesResolver = () => ({
    variables: {},
    light: { "--mantine-color-body": "#f6f5f2", "--mantine-primary-color-contrast": "#ffffff" },
    dark: { "--mantine-color-body": "#0b0f1a", "--mantine-primary-color-contrast": "#0b0f1a" },
});
