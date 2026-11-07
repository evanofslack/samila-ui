export default function About() {
    return (
        <section className="flex flex-col items-center justify-center px-4 drop-shadow-sm">
            <h2 className="mt-14 mb-2 text-center text-3xl font-semibold md:mt-18 md:mb-4">
                Samila creates generative art
            </h2>
            <div className="w-full max-w-2xl bg-white px-6 py-4 font-light lg:px-8">
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
