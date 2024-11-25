import axios from "axios";
import fs from "fs";
import { NextResponse } from "next/server";
import path from "path";

export async function POST(req) {
    try {
        const body = await req.json();
        const { url } = body;

        if (!url) {
            return NextResponse.json({ error: "Aucune URL fournie" }, { status: 400 });
        }

        const response = await axios.get(url, { responseType: "stream" });

        const fileName = `${Date.now()}.jpg`;
        const uploadPath = path.join(process.cwd(), "public/uploads", fileName);
        const writer = fs.createWriteStream(uploadPath);

        // Télécharger et sauvegarder l'image
        response.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on("finish", resolve);
            writer.on("error", reject);
        });

        const fileUrl = `/uploads/${fileName}`;
        return NextResponse.json({ url: fileUrl });
    } catch (err) {
        console.error("Erreur lors de l'upload depuis l'URL :", err);
        return NextResponse.json({ error: "Erreur lors de l'upload depuis l'URL" }, { status: 500 });
    }
}
