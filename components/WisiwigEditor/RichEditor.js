import Bold from "@tiptap/extension-bold";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Italic from "@tiptap/extension-italic";
import Strike from "@tiptap/extension-strike";
import TextStyle from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

import Blockquote from "@tiptap/extension-blockquote";
import BulletList from "@tiptap/extension-bullet-list";
import ListItem from "@tiptap/extension-list-item";
import ImageResize from "tiptap-extension-resize-image";
import "./RichEditor.css";
import Toolbar from "./Toolbar";

const TiptapEditor = () => {
    const editor = useEditor({
        extensions: [
            StarterKit,
            {
                name: "indent",
                addCommands() {
                    return {
                        indent:
                            () =>
                            ({ commands }) => {
                                return commands.setNode("paragraph", { indent: 1 });
                            },
                        outdent:
                            () =>
                            ({ commands }) => {
                                return commands.setNode("paragraph", { indent: -1 });
                            },
                    };
                },
                addKeyboardShortcuts() {
                    return {
                        Tab: () => this.editor.commands.indent(),
                        "Shift-Tab": () => this.editor.commands.outdent(),
                    };
                },
            },
            ,
            Bold,
            Italic,
            Underline,
            Strike,
            TextStyle,
            Color,
            Blockquote,
            Highlight.configure({ multicolor: true }),
            ImageResize.configure({ inline: true }),
            BulletList,
            ListItem,
        ],
        content: "<p>Hello, Tiptap with Icons!</p>",
    });

    return (
        <div className="editor">
            <Toolbar editor={editor} />
            <EditorContent editor={editor} />
        </div>
    );
};

export default TiptapEditor;
