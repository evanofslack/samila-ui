export default function About() {
    return (
        <div className="flex flex-col items-center justify-center">
            <h1 className="text-3xl text-center font-semibold mt-14 md:mt-18 mb-2 md:mb-4 w-3/4">
                Samila is a generative artist
            </h1>
            <div className="bg-white px-6 py-4 mx-4 max-w-2xl font-light lg:px-8">
                <p className="pb-4">
                    Applying mathematical equations to thousands of psuedo-random points, Samila
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
