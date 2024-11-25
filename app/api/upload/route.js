import fs from "fs";
import multer from "multer";
import { NextResponse } from "next/server";
import path from "path";
import { promisify } from "util";

const upload = multer({ dest: "./uploads/" });
const uploadMiddleware = promisify(upload.single("file"));

export async function POST(req) {
    try {
        // Appliquer le middleware multer pour récupérer le fichier
        const formData = await req.formData();
        const file = formData.get("file");

        if (!file) {
            return NextResponse.json({ error: "Aucun fichier reçu" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const fileName = `${Date.now()}_${file.name}`;
        const uploadPath = path.join(process.cwd(), "public/uploads", fileName);

        // Sauvegarder l'image sur le serveur
        await fs.promises.writeFile(uploadPath, buffer);

        const fileUrl = `/uploads/${fileName}`;
        return NextResponse.json({ url: fileUrl });
    } catch (err) {
        console.error("Erreur lors de l'upload :", err);
        return NextResponse.json({ error: "Erreur lors de l'upload" }, { status: 500 });
    }
}
