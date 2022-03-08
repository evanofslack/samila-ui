type ColorProps = {
    color: string;
    title: string;
    active: string;
    setActive: React.Dispatch<React.SetStateAction<string>>;
};

export default function ColorInput({ color, title, active, setActive }: ColorProps) {
    return (
        <div className="flex flex-row items-center p-1" onClick={() => setActive(title)}>
            <p className={`pr-2 font-light ${active === title && "underline font-normal"}`}>
                {title}
            </p>
            <div
                className="w-8 h-8 border border-black"
                style={{
                    backgroundColor: color,
                }}
            />
        </div>
    );
}
