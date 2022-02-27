import { GeneratorParams } from "../interfaces/index";
import { useState, useCallback } from "react";
import useEffectCallback from "./useEffectCallback";

export default function useGenerator(params: GeneratorParams) {
    const [img, setImg] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Convert params into a query string (i.e. eq=1&color="red"&bg="blue")
    var queryString = Object.entries(params)
        .filter(([key, value]) => value != null)
        .map(([key, value]) => key + "=" + value)
        .join("&");

    // remove the '#' as our API doesn't accept them
    const imageURL = ("/api/image?" + queryString).replace(/#/g, "");

    const fetchImage = useCallback(() => {
        console.log(imageURL);
        setLoading(true);
        fetch(imageURL)
            .then((resp) => resp.blob())
            .then((imageBlob) => {
                const imageObjectURL = URL.createObjectURL(imageBlob);
                setImg(imageObjectURL);
                setLoading(false);
            });
    }, [params]);

    // Only fetch new image when params change and not on first render
    useEffectCallback(fetchImage);
    return {
        img,
        loading,
    };
}
