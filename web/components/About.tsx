export default function About() {
    return (
        <div className="flex flex-col items-center justify-center drop-shadow-sm">
            <h2 className="mt-14 mb-2 w-3/4 text-center text-3xl font-semibold md:mt-18 md:mb-4">
                Samila creates generative art
            </h2>
            <div className="mx-4 max-w-2xl bg-white px-6 py-4 font-light lg:px-8">
                <p className="pb-4">
                    Applying mathematical equations to thousands of pseudo-random points, Samila
                    creates unique geometric patterns. Each generation is driven by a random seed
                    which can be used for identification and replication.
                </p>
                <p>
                    <a className="underline" href="https://github.com/sepandhaghighi/samila">
                        Samila
                    </a>{" "}
                    is a python library built on top of matplotlib. Its core generation
                    functionality has been exposed with a REST API through{" "}
                    <a className="underline" href="https://github.com/evanofslack/samila-api">
                        samila-api
                    </a>
                    .
                </p>
            </div>
        </div>
    );
}
