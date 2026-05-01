import { marked } from "marked";
import sanitizeHtml from "sanitize-html";
import { createHighlighter } from "shiki";

let highlighter: Awaited<ReturnType<typeof createHighlighter>> | null = null;

async function getHighlighter() {
  if (!highlighter) {
    highlighter = await createHighlighter({
      themes: ["github-light", "github-dark"],
      langs: [
        "javascript",
        "typescript",
        "html",
        "css",
        "json",
        "bash",
        "python",
        "go",
        "rust",
        "sql",
        "yaml",
        "markdown",
        "jsx",
        "tsx",
        "vue",
        "shell",
        "diff",
        "dockerfile",
      ],
    });
  }
  return highlighter;
}

export async function renderMarkdown(content: string): Promise<string> {
  const hl = await getHighlighter();

  const renderer = new marked.Renderer();
  renderer.code = function ({ text, lang }) {
    const language = lang || "text";
    try {
      return hl.codeToHtml(text, {
        lang: language,
        themes: { light: "github-light", dark: "github-dark" },
      });
    } catch {
      return `<pre><code class="language-${language}">${text}</code></pre>`;
    }
  };

  const html = await marked(content, { renderer });

  return sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      "img",
      "pre",
      "code",
      "span",
      "figure",
      "figcaption",
      "input",
    ]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      "*": ["class", "id"],
      span: ["style", "class"],
      pre: ["class", "style", "tabindex"],
      code: ["class"],
      img: ["src", "alt", "title", "loading", "width", "height"],
      a: ["href", "title", "target", "rel"],
      input: ["type", "checked", "disabled"],
    },
    allowedStyles: {
      span: {
        color: [/.*/],
        "font-style": [/.*/],
        "font-weight": [/.*/],
        "text-decoration": [/.*/],
      },
      pre: {
        background: [/.*/],
        "background-color": [/.*/],
        color: [/.*/],
        padding: [/.*/],
        "border-radius": [/.*/],
        overflow: [/.*/],
      },
    },
  });
}
