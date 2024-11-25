"use client";

import axios from "axios";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { useEffect, useRef, useState } from "react";

//Quill.register("modules/imageResize", ImageResize);

const WisiwigEditor = () => {
    const editorRef = useRef(null);
    const [isUploading, setIsUploading] = useState(false);
    const quillContainerRef = useRef(null); // Conteneur de l'éditeur

    useEffect(() => {
        if (!quillContainerRef.current || editorRef.current) return; // Évite la double initialisation

        // Initialisation de l'éditeur Quill
        const quill = new Quill(quillContainerRef.current, {
            theme: "snow",
            modules: {
                toolbar: [
                    [{ header: [1, 2, 3, false] }], // Titres
                    ["bold", "italic", "underline"], // Mise en forme
                    [{ color: [] }, { background: [] }], // Couleur de police et de fond
                    ["link", "image"], // Liens et images
                    [{ align: [] }], // Alignement
                    [{ list: "ordered" }, { list: "bullet" }], // Listes
                    ["clean"], // Nettoyer la mise en forme
                ],
                ImageResize: {
                    modules: ["Resize", "DisplaySize", "Toolbar"],
                },
            },
        });

        // Gestion des images collées
        quill.root.addEventListener("paste", async (e) => {
            // Empêche Quill de gérer les images collées nativement
            e.preventDefault();

            const clipboardData = e.clipboardData || window.clipboardData;
            const items = clipboardData.items;

            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                if (item.type.indexOf("image") !== -1) {
                    const file = item.getAsFile();
                    if (file) {
                        await handleImageUpload(file, quill);
                    }
                }
            }
        });

        // Gestion des images insérées via le bouton "image"
        quill.getModule("toolbar").addHandler("image", async () => {
            const url = prompt("Entrez l'URL de l'image :");
            if (url) {
                await handleImageFromUrl(url, quill);
            }
        });

        editorRef.current = quill;
    }, []);

    // Fonction pour insérer une image dans l'éditeur
    const insertImage = (quill, url) => {
        const range = quill.getSelection() || { index: 0 };
        quill.insertEmbed(range.index, "image", url);
    };

    // Gestion commune de l'upload des images
    const handleImageUpload = async (file, quill) => {
        if (!file || !file.type.startsWith("image/")) {
            alert("Veuillez sélectionner un fichier image valide.");
            return;
        }

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await axios.post("/api/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            insertImage(quill, response.data.url);
        } catch (error) {
            console.error("Erreur lors de l'upload de l'image :", error);
            alert("Échec de l'upload de l'image.");
        } finally {
            setIsUploading(false);
        }
    };

    // Gestion des images insérées via URL
    const handleImageFromUrl = async (url, quill) => {
        if (!url.startsWith("http")) {
            alert("Veuillez entrer une URL valide.");
            return;
        }

        setIsUploading(true);
        try {
            const response = await axios.post("/api/upload-from-url", { url });
            insertImage(quill, response.data.url);
        } catch (error) {
            console.error("Erreur lors de l'upload de l'image :", error);
            alert("Échec de l'upload de l'image.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="flex flex-col items-center">
            {isUploading && <div className="mb-2 text-blue-500">Téléchargement en cours...</div>}
            <div
                ref={quillContainerRef}
                className="w-full max-w-3xl border border-gray-300 rounded-md p-4"
                style={{
                    minHeight: "300px",
                }}
            ></div>
        </div>
    );
};

export default WisiwigEditor;
