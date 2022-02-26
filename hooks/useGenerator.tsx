import { GeneratorParams } from "../interfaces/index";
import { useState, useEffect } from "react";

export default function useGenerator(params: GeneratorParams) {
    const [img, setImg] = useState("");
    const [loading, setLoading] = useState(true);

    var queryString = Object.entries(params)
        .filter(([key, value]) => value != null)
        .map(([key, value]) => key + "=" + value)
        .join("&");

    const imageURL = "/api/image?" + queryString;

    async function fetchImage() {
        console.log(imageURL);
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
        // console.log(params);
    }, [params]);

    return {
        img,
        loading,
    };
}
