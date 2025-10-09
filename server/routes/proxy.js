import express from "express";
const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const targetUrl = req.query.url;
        console.log("targetUrl to proxy", targetUrl);
        if (!targetUrl) return res.status(400).send("Missing URL");

        const url = new URL(targetUrl.startsWith("http") ? targetUrl : `https://${targetUrl}`);

        const response = await fetch(url.toString(), {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117 Safari/537.36",
                Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.5",
            },
            redirect: "follow",
        });

        const html = await response.text();

        let extracted = null;
        const hostname = url.hostname;

        if (hostname.includes("benzinga.com")) {
            extracted = extractById(html, "article-body") || extractByClass(html, "article-body") || extractByTag(html, "article");
        }
        else if (hostname.includes("fool.com")) {
            extracted = extractByClass(html, "article-body") || extractByTag(html, "article");
        }
        else if (hostname.includes("reuters.com")) {
            extracted = extractByTag(html, "main") || extractByTag(html, "article");
        } else if (hostname.includes("bloomberg.com")) {
            extracted = extractByClass(html, "body__inner-container") || extractByTag(html, "article");
        } else {
            extracted = extractByTag(html, "main") || extractByTag(html, "article") || extractParagraphs(html);
        }

        if (extracted) {
            extracted = stripCommentsScriptsStyles(extracted);
            extracted = fixRelativeUrls(extracted, url);
        } else {
            extracted = "<p>Article content not found.</p>";
        }

        const output = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    body {
      background: #f8f9fa;
      color: #212529;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      line-height: 1.7;
      margin: 0;
      padding: 2rem;
      display: flex;
      justify-content: center;
    }
    article {
      background: #ffffff;
      max-width: 800px;
      width: 100%;
      box-shadow: 0 2px 10px rgba(0,0,0,0.05);
      border-radius: 12px;
      padding: 2rem 3rem;
    }
    h1, h2, h3 {
      color: #0d6efd;
      line-height: 1.3;
    }
    p {
      margin-bottom: 1.2rem;
      font-size: 1.05rem;
    }
    a {
      color: #0d6efd;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
    img {
      max-width: 100%;
      border-radius: 10px;
      margin: 1rem 0;
    }
  </style>
</head>
<body>
  <article class="article-container">
    ${extracted}
    <footer>📰 Source: ${hostname}</footer>
  </article>
</body>
</html>`;

        res.status(response.status);
        res.set("Content-Type", "text/html");
        res.set("Access-Control-Allow-Origin", "*");
        res.send(output);
    } catch (err) {
        console.error("Proxy error:", err);
        res.status(500).send("Proxy failed");
    }
});

function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function findOpeningTagByAttr(html, attrName, attrValue) {
    const attrPattern =
        attrName === "class"
            ? new RegExp(
                `<([a-zA-Z0-9-]+)(?:\\s[^>]*)?\\bclass\\s*=\\s*["'][^"']*\\b${escapeRegex(
                    attrValue
                )}\\b[^"']*["'][^>]*>`,
                "i"
            )
            : new RegExp(
                `<([a-zA-Z0-9-]+)(?:\\s[^>]*)?\\bid\\s*=\\s*["']${escapeRegex(
                    attrValue
                )}["'][^>]*>`,
                "i"
            );

    const m = attrPattern.exec(html);
    if (!m) return null;
    const tag = m[1];
    const startIdx = m.index;
    const openTagEnd = html.indexOf(">", startIdx) + 1;
    return { tag, startIdx, openTagEnd };
}

function extractElementByRange(html, startIndex, openTagEnd, tag) {
    let pos = openTagEnd;
    let depth = 1;
    const openSeq = `<${tag}`;
    const closeSeq = `</${tag}>`;

    while (depth > 0) {
        const nextOpen = html.indexOf(openSeq, pos);
        const nextClose = html.indexOf(closeSeq, pos);

        if (nextClose === -1) {
            // no matching close found — return until end
            pos = html.length;
            break;
        }

        if (nextOpen !== -1 && nextOpen < nextClose) {
            depth++;
            pos = nextOpen + openSeq.length;
        } else {
            depth--;
            pos = nextClose + closeSeq.length;
        }
    }

    return html.substring(startIndex, pos);
}

function extractById(html, id) {
    const found = findOpeningTagByAttr(html, "id", id);
    if (!found) return null;
    return extractElementByRange(html, found.startIdx, found.openTagEnd, found.tag);
}

function extractByClass(html, className) {
    const found = findOpeningTagByAttr(html, "class", className);
    if (!found) return null;
    return extractElementByRange(html, found.startIdx, found.openTagEnd, found.tag);
}

function extractByTag(html, tag) {
    const tagRegex = new RegExp(`<${escapeRegex(tag)}(\\s|>)`, "i");
    const m = tagRegex.exec(html);
    if (!m) return null;
    const startIdx = m.index;
    const openTagEnd = html.indexOf(">", startIdx) + 1;
    return extractElementByRange(html, startIdx, openTagEnd, tag);
}

function extractParagraphs(html) {
    const matches = html.match(/<p[^>]*>[\s\S]*?<\/p>/gi) || [];
    return matches.join("\n");
}

function stripCommentsScriptsStyles(html) {
    return html
        .replace(/<!--[\s\S]*?-->/g, "")
        .replace(/<script\b[\s\S]*?<\/script>/gi, "")
        .replace(/<style\b[\s\S]*?<\/style>/gi, "")
        .replace(/<link\b[^>]*rel=["']?stylesheet["']?[^>]*>/gi, "");
}

function fixRelativeUrls(fragmentHtml, baseUrl) {
    fragmentHtml = fragmentHtml.replace(
        /(src|href)=["'](\/[^"']*)["']/gi,
        (m, attr, path) => `${attr}="${baseUrl.origin}${path}"`
    );

    fragmentHtml = fragmentHtml.replace(/(src|href)=["']\/\/([^"']+)["']/gi, (m, attr, rest) => {
        const protocol = baseUrl.protocol || "https:";
        return `${attr}="${protocol}//${rest}"`;
    });

    return fragmentHtml;
}

export default router;
