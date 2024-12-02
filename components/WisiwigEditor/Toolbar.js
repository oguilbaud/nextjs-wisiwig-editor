import { useState } from "react";
import { HexColorPicker } from "react-colorful";
import { FaListOl, FaListUl, FaQuoteLeft } from "react-icons/fa";
import {
    MdFormatBold,
    MdFormatColorFill,
    MdFormatColorText,
    MdFormatItalic,
    MdFormatStrikethrough,
    MdFormatUnderlined,
    MdImage,
} from "react-icons/md";

import axios from "axios";
import "./Toolbar.css";

/*
onClick={() => {
                    const url = window.prompt("Enter image URL:");
                    if (url) {
                        editor.chain().focus().setImage({ src: url }).run();
                    }
                }}
*/

const Toolbar = ({ editor }) => {
    const [isUploading, setIsUploading] = useState(false);
    const [showTextColorPicker, setShowTextColorPicker] = useState(false);
    const [showBackgroundColorPicker, setShowBackgroundColorPicker] = useState(false);
    const [showMenuImage, setShowMenuImage] = useState(false);
    const [menuImagePosition, setMnuImagePosition] = useState({ left: 0, top: 0 });

    const [textColor, setTextColor] = useState("#000000");
    const [backgroundColor, setBackgroundColor] = useState("#ffffff");

    const closeImageMenu = () => setShowMenuImage(false);

    const handleTextColorChange = (color) => {
        setTextColor(color);
        editor.chain().focus().setColor(color).run();
        setShowTextColorPicker(false);
    };

    const handleBackgroundColorChange = (color) => {
        setBackgroundColor(color);
        editor.chain().focus().setHighlight({ color }).run();
        setShowBackgroundColorPicker(false);
    };

    const handleImageButtonClick = (e) => {
        e.stopPropagation();

        const toolbarButton = document.querySelector(".mnu-image");
        const rect = toolbarButton.getBoundingClientRect();
        setMnuImagePosition({ left: rect.left, top: rect.bottom });
        setShowMenuImage(true);
    };

    const applyHeading = (level) => {
        if (level === "paragraph") {
            editor.chain().focus().setParagraph().run();
        } else {
            editor.chain().focus().toggleHeading({ level }).run();
        }
    };

    const hideColorSelectors = (e) => {
        setShowTextColorPicker(false);
        setShowBackgroundColorPicker(false);
        closeImageMenu();
        console.log(e);
    };

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
    const handleImageFromUrl = async (url) => {
        if (!isValidUrl(url)) {
            alert("Veuillez entrer une URL valide.");
            return;
        }

        setIsUploading(true);
        try {
            const response = await axios.post("/api/upload-from-url", { url });
            editor.chain().focus().setImage({ src: response.data.url }).run();
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

    const isValidUrl = (url) => {
        try {
            const parsedUrl = new URL(url);
            return parsedUrl.protocol === "https:" || parsedUrl.protocol === "http:";
        } catch (_) {
            return false;
        }
    };

    const askUrl = () => {
        const url = prompt("Entrez l'URL de l'image :");
        if (url) {
            handleImageFromUrl(url);
        }
        closeImageMenu();
    };

    return (
        <div className="toolbar" onClick={hideColorSelectors}>
            {/* Combobox for Heading Levels */}
            <select
                className="heading-select"
                onChange={(e) => applyHeading(e.target.value === "paragraph" ? "paragraph" : parseInt(e.target.value))}
            >
                <option value="paragraph" className="normal-text">
                    Normal
                </option>
                <option value="1" className="heading-text h1">
                    H1
                </option>
                <option value="2" className="heading-text h2">
                    H2
                </option>
                <option value="3" className="heading-text h3">
                    H3
                </option>
                <option value="4" className="heading-text h4">
                    H4
                </option>
                <option value="5" className="heading-text h5">
                    H5
                </option>
                <option value="6" className="heading-text h6">
                    H6
                </option>
            </select>

            {/* Bold */}
            <button className="icon-button" onClick={() => editor.chain().focus().toggleBold().run()} title="Bold">
                <MdFormatBold />
            </button>

            {/* Italic */}
            <button className="icon-button" onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic">
                <MdFormatItalic />
            </button>

            {/* Underline */}
            <button className="icon-button" onClick={() => editor.chain().focus().toggleUnderline().run()} title="Underline">
                <MdFormatUnderlined />
            </button>

            {/* Strikethrough */}
            <button className="icon-button" onClick={() => editor.chain().focus().toggleStrike().run()} title="Strikethrough">
                <MdFormatStrikethrough />
            </button>

            <button onClick={() => editor.chain().focus().toggleBlockquote().run()}>
                <FaQuoteLeft /> {/* Icône de citation */}
            </button>

            {/* Text color */}
            <div className="color-picker-container">
                <button
                    className="icon-button"
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowTextColorPicker(!showTextColorPicker);
                    }}
                    title="Text Color"
                >
                    <MdFormatColorText color={textColor} />
                </button>
                {showTextColorPicker && (
                    <div className="color-picker-popover">
                        <HexColorPicker color={textColor} onChange={handleTextColorChange} />
                    </div>
                )}
            </div>

            {/* Background color */}
            <div className="color-picker-container">
                <button
                    className="icon-button"
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowBackgroundColorPicker(!showBackgroundColorPicker);
                    }}
                    title="Background Color"
                >
                    <MdFormatColorFill backgroundColor={backgroundColor} />
                </button>
                {showBackgroundColorPicker && (
                    <div className="color-picker-popover">
                        <HexColorPicker color={backgroundColor} onChange={handleBackgroundColorChange} />
                    </div>
                )}
            </div>

            {/* Image from URL */}
            <button className="icon-button mnu-image" onClick={handleImageButtonClick} title="Insert Image (URL)">
                <MdImage />
            </button>
            {showMenuImage && (
                <div className="context-menu-image" style={{ left: menuImagePosition.left, top: menuImagePosition.top }}>
                    <button onClick={askUrl}>Télécharger depuis une URL</button>
                    <input type="file" accept="image/*" onChange={handleImageSelection} style={{ display: "none" }} id="fileInput" />
                    <label htmlFor="fileInput" style={{ cursor: "pointer" }}>
                        Télécharger depuis le disque local
                    </label>
                </div>
            )}

            <button onClick={() => editor.chain().focus().toggleOrderedList().run()}>
                <FaListOl /> {/* Icône pour la liste ordonnée */}
            </button>
            <button onClick={() => editor.chain().focus().toggleBulletList().run()}>
                <FaListUl /> {/* Icône pour la liste non ordonnée */}
            </button>
        </div>
    );
};

export default Toolbar;
