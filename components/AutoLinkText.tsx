import { Fragment, type ReactNode } from "react";

const URL_PATTERN = /(?:https?:\/\/|www\.)[^\s<>"']+/gi;
const TRAILING_PUNCTUATION_PATTERN = /[.,!?;:，。！？；：、）)\]]+$/;

interface AutoLinkTextProps {
  text: string;
}

function stripTrailingPunctuation(value: string) {
  const trailing = value.match(TRAILING_PUNCTUATION_PATTERN)?.[0] ?? "";
  return {
    linkText: trailing ? value.slice(0, -trailing.length) : value,
    trailing,
  };
}

function toSafeHref(value: string) {
  const href = value.toLowerCase().startsWith("www.")
    ? `https://${value}`
    : value;

  try {
    const url = new URL(href);
    return url.protocol === "http:" || url.protocol === "https:" ? href : null;
  } catch {
    return null;
  }
}

export function AutoLinkText({ text }: AutoLinkTextProps) {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(URL_PATTERN)) {
    const matchedText = match[0];
    const matchIndex = match.index ?? 0;

    if (matchIndex > lastIndex) {
      nodes.push(text.slice(lastIndex, matchIndex));
    }

    const { linkText, trailing } = stripTrailingPunctuation(matchedText);
    const href = toSafeHref(linkText);

    if (href) {
      nodes.push(
        <a
          key={`${matchIndex}-${linkText}`}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline underline-offset-2 hover:opacity-80"
        >
          {linkText}
        </a>,
      );
      if (trailing) nodes.push(trailing);
    } else {
      nodes.push(matchedText);
    }

    lastIndex = matchIndex + matchedText.length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return <Fragment>{nodes}</Fragment>;
}
