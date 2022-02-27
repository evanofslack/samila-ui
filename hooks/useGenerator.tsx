import { GeneratorParams } from "../interfaces/index";
import { useState, useEffect } from "react";

export default function useGenerator(params: GeneratorParams) {
    const [img, setImg] = useState("");
    const [loading, setLoading] = useState(true);

    // Convert params into a query string (i.e. eq=1&color="red"&bg="blue")
    var queryString = Object.entries(params)
        .filter(([key, value]) => value != null)
        .map(([key, value]) => key + "=" + value)
        .join("&");

    // remove the '#' as our API doesn't accept them
    const imageURL = ("/api/image?" + queryString).replace(/#/g, "");

    async function fetchImage() {
        console.log(imageURL);
        setLoading(true);
        fetch(imageURL)
            .then((resp) => resp.blob())
            .then((imageBlob) => {
                const imageObjectURL = URL.createObjectURL(imageBlob);
                setImg(imageObjectURL);
                setLoading(false);
            });
    }
    useEffect(() => {
        fetchImage();
        console.log(params);
    }, [params]);

    return {
        img,
        loading,
    };
}
