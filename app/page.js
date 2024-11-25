"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const WisiwigEditor = dynamic(() => import("@/components/WisiwigEditor/WisiwigEditor"), {
    ssr: false, // Désactive le rendu côté serveur
});

export default function Home() {
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        // Assurez-vous que le composant ne s'exécute qu'une fois le DOM chargé
        setIsReady(true);
    }, []);

    return (
        <div>
            <h1>Éditeur de texte WYSIWYG</h1>
            {isReady ? <WisiwigEditor /> : <p>Chargement de l&apos;éditeur...</p>}
        </div>
    );
}
