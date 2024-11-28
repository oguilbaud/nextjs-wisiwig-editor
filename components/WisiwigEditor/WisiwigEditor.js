"use client";

import QuillBetterImage from "@umn-latis/quill-better-image-module";
import axios from "axios";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { useEffect, useRef, useState } from "react";
import "./WisiwigEditor.css";

Quill.register("modules/betterImage", QuillBetterImage);

const WisiwigEditor = () => {
    const editorRef = useRef(null);
    const [isUploading, setIsUploading] = useState(false);
    const quillContainerRef = useRef(null); // Conteneur de l'éditeur
    const [contextMenuVisible, setContextMenuVisible] = useState(false);
    const [contextMenuPosition, setContextMenuPosition] = useState({ left: 0, top: 0 });

    const closeContextMenu = () => setContextMenuVisible(false);

    const toolbarOptions = [
        [{ header: [1, 2, 3, 4, 5, false] }], // Titres
        ["bold", "italic", "underline", "blockquote"], // Mise en forme
        [{ color: [] }, { background: [] }], // Couleur de police et de fond
        ["link", "image"], // Liens et images
        [{ align: [] }], // Alignement
        [{ list: "ordered" }, { list: "bullet" }], // Listes
        ["clean"], // Nettoyer la mise en forme
    ];

    useEffect(() => {
        if (!quillContainerRef.current || editorRef.current) return; // Évite la double initialisation

        const handleImageButtonClick = () => {
            const toolbarButton = document.querySelector(".ql-image");
            const rect = toolbarButton.getBoundingClientRect();
            setContextMenuPosition({ left: rect.left, top: rect.bottom });
            setContextMenuVisible(true);
        };

        // Initialisation de l'éditeur Quill
        const quill = new Quill(quillContainerRef.current, {
            theme: "snow",
            modules: {
                toolbar: {
                    container: toolbarOptions,
                    handlers: {
                        image: handleImageButtonClick,
                    },
                },
                betterImage: {},
            },
        });
        window.Quill = Quill;

        // Gestion des images collées
        quill.root.addEventListener("paste", async (e) => {
            // Empêche Quill de gérer les images collées nativement
            e.preventDefault();

            if (!isUploading) {
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
            }
        });

        editorRef.current = quill;

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Fonction pour insérer une image dans l'éditeur
    const insertImage = (quill, url) => {
        const range = quill.getSelection() || { index: 0 };
        quill.insertEmbed(range.index, "image", url);
    };

    const isValidUrl = (url) => {
        try {
            const parsedUrl = new URL(url);
            return parsedUrl.protocol === "https:" || parsedUrl.protocol === "http:";
        } catch (_) {
            return false;
        }
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
        if (!isValidUrl(url)) {
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

    const handleImageSelection = (event) => {
        const file = event.target.files[0];
        const quill = editorRef.current;
        if (file && quill) {
            const formData = new FormData();
            formData.append("file", file);

            fetch("/api/upload", {
                method: "POST",
                body: formData,
            })
                .then((response) => response.json())
                .then((data) => {
                    insertImage(quill, data.url);
                })
                .catch((error) => console.error("Erreur lors de l’upload:", error));
        }
    };

    const askUrl = () => {
        const quill = editorRef.current;
        if (quill) {
            const url = prompt("Entrez l'URL de l'image :");
            if (url) {
                handleImageFromUrl(url, quill);
            }
        }
        closeContextMenu();
    };

    const clickEditor = (e) => {
        const [contextMenu] = document.getElementsByClassName("context-menu-image");
        const [btnImage] = document.getElementsByClassName("ql-image");
        if (contextMenu && btnImage && !contextMenu.contains(e.target) && !btnImage.contains(e.target) && e.target.className !== "ql-image") {
            closeContextMenu();
        }
    };

    return (
        <>
            <div className="flex flex-col items-center" onClick={clickEditor}>
                {isUploading && <div className="mb-2 text-blue-500">Téléchargement en cours...</div>}
                <div
                    ref={quillContainerRef}
                    className="w-full max-w-3xl border border-gray-300 rounded-md p-4"
                    style={{
                        minHeight: "300px",
                    }}
                ></div>
            </div>
            {contextMenuVisible && (
                <div className="context-menu-image" style={{ left: contextMenuPosition.left, top: contextMenuPosition.top }}>
                    <button onClick={askUrl}>Télécharger depuis une URL</button>
                    <input type="file" accept="image/*" onChange={handleImageSelection} style={{ display: "none" }} id="fileInput" />
                    <label htmlFor="fileInput" style={{ cursor: "pointer" }}>
                        Télécharger depuis le disque local
                    </label>
                </div>
            )}
        </>
    );
};

export default WisiwigEditor;
