import { Grid } from "@mantine/core";
import GalleryImage from "./GalleryImage";

export default function Gallery() {
    return (
        <div>
            <h1 className="flex items-center justify-center w-full mt-12">
                <div className="text-2xl font-semibold"> Gallery</div>
            </h1>
            <Grid className="p-6">
                <Grid.Col span={6} sm={4} xl={3}>
                    <GalleryImage />
                </Grid.Col>
                <Grid.Col span={6} sm={4} xl={3}>
                    <GalleryImage />
                </Grid.Col>
                <Grid.Col span={6} sm={4} xl={3}>
                    <GalleryImage />
                </Grid.Col>
                <Grid.Col span={6} sm={4} xl={3}>
                    <GalleryImage />
                </Grid.Col>
            </Grid>
        </div>
    );
}
