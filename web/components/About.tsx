export default function About() {
    return (
        <section
            id="how-it-works"
            className="mx-auto flex max-w-7xl scroll-mt-16 flex-col items-center px-4 pt-24 sm:px-6"
        >
            <h2 className="mb-4 text-center text-2xl font-semibold tracking-tight sm:text-3xl">
                Samila creates generative art
            </h2>
            <div className="w-full max-w-2xl text-muted">
                <p className="pb-4">
                    Applying mathematical equations to thousands of pseudo-random points, Samila
                    creates unique geometric patterns. Each generation is driven by a random seed
                    which can be used for identification and replication.
                </p>
                <p className="pb-4">
                    <a className="underline" href="https://github.com/sepandhaghighi/samila">
                        Samila
                    </a>{" "}
                    is a python library built on top of matplotlib. Its core generation
                    functionality is exposed through a public REST API, which renders every image on
                    this page.
                </p>
                <p>
                    The API is free to use from your own projects: see the{" "}
                    <a className="underline" href="/api/docs">
                        API docs
                    </a>{" "}
                    for every option.
                </p>
            </div>
        </section>
    );
}
