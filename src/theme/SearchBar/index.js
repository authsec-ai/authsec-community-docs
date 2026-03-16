import React, { useEffect, useMemo, useRef, useState } from "react";
import { useHistory } from "@docusaurus/router";
import useGlobalData from "@docusaurus/useGlobalData";
import styles from "./styles.module.css";

const FEATURED_DOC_IDS = [
  "getting-started/overview",
  "getting-started/sign-in-setup",
  "administration/authentication/index",
  "administration/rbac/getting-started",
  "autonomous-agents/overview",
  "ciba/index",
  "sdk/index",
  "status/index",
];

const FEATURED_HINTS = {
  "getting-started/overview": "Start here with AuthSec platform basics",
  "getting-started/sign-in-setup": "Configure account login and onboarding",
  "administration/authentication/index":
    "Set up OIDC, OAuth 2.1, and SAML providers",
  "administration/rbac/getting-started":
    "Define roles, permissions, and scopes",
  "autonomous-agents/overview":
    "Learn M2M security for autonomous workloads",
  "ciba/index": "Voice and headless authentication flows",
  "sdk/index": "SDK guides for clients, workloads, and RBAC",
  "status/index": "Check current AuthSec system health",
};

function SearchGlyph() {
  return (
    <svg
      className={styles.searchIcon}
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="8.25"
        cy="8.25"
        r="5.75"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M12.6 12.6L17 17"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function humanizeDocId(docId = "", path = "") {
  const source = docId || path;
  const segments = source.split("/").filter(Boolean);
  if (segments.length === 0) {
    return "Untitled";
  }

  let slug = segments[segments.length - 1];
  if (slug === "index" && segments.length > 1) {
    slug = segments[segments.length - 2];
  }

  return slug
    .replace(/[-_]+/g, " ")
    .replace(/\bm2m\b/gi, "M2M")
    .replace(/\bciba\b/gi, "CIBA")
    .replace(/\bsdk\b/gi, "SDK")
    .replace(/\brbac\b/gi, "RBAC")
    .replace(/\b\w/g, (ch) => ch.toUpperCase());
}

function useDocsIndex() {
  const globalData = useGlobalData();
  const docsData = globalData["docusaurus-plugin-content-docs"] || {};

  return useMemo(() => {
    const seenPermalinks = new Set();
    const items = [];

    Object.values(docsData).forEach((pluginData) => {
      const versions = pluginData?.versions || [];
      versions.forEach((version) => {
        const docs = version?.docs || [];
        docs.forEach((doc) => {
          const permalink = doc?.permalink || doc?.path;
          if (!permalink || seenPermalinks.has(permalink)) {
            return;
          }

          seenPermalinks.add(permalink);
          items.push({
            title: doc.title || humanizeDocId(doc.id, doc.path),
            description: doc.description || "",
            docId: doc.id || "",
            docPath: doc.path || "",
            permalink,
          });
        });
      });
    });

    return items;
  }, [docsData]);
}

export default function SearchBar() {
  const history = useHistory();
  const docsIndex = useDocsIndex();
  const inputRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const normalizedQuery = query.trim().toLowerCase();

  const searchResults = useMemo(() => {
    return docsIndex
      .filter((item) => {
        const haystack =
          `${item.title} ${item.description} ${item.docId} ${item.docPath}`.toLowerCase();
        return haystack.includes(normalizedQuery);
      })
      .slice(0, 8);
  }, [docsIndex, normalizedQuery]);

  const recommendedResults = useMemo(() => {
    const byId = new Map(docsIndex.map((item) => [item.docId, item]));
    const recommended = FEATURED_DOC_IDS.map((id) => byId.get(id)).filter(
      Boolean,
    );

    if (recommended.length < 8) {
      const seen = new Set(recommended.map((item) => item.permalink));
      docsIndex.forEach((item) => {
        if (recommended.length >= 8 || seen.has(item.permalink)) {
          return;
        }
        seen.add(item.permalink);
        recommended.push(item);
      });
    }

    return recommended;
  }, [docsIndex]);

  const visibleResults = normalizedQuery ? searchResults : recommendedResults;

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const onKeyDown = (event) => {
      const isShortcut =
        (event.metaKey || event.ctrlKey) &&
        event.key.toLowerCase() === "k";
      if (isShortcut) {
        event.preventDefault();
      }

      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  useEffect(() => {
    const onGlobalShortcut = (event) => {
      const isShortcut =
        (event.metaKey || event.ctrlKey) &&
        event.key.toLowerCase() === "k";
      if (!isShortcut) {
        return;
      }
      event.preventDefault();
      setIsOpen(true);
    };

    document.addEventListener("keydown", onGlobalShortcut);
    return () => document.removeEventListener("keydown", onGlobalShortcut);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    document.body.style.overflow = "hidden";
    setActiveIndex(0);
    setTimeout(() => inputRef.current?.focus(), 0);
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    setActiveIndex(0);
  }, [normalizedQuery]);

  const openResult = (permalink) => {
    if (!permalink) {
      return;
    }
    setQuery("");
    setIsOpen(false);
    history.push(permalink);
  };

  const closeModal = () => {
    setIsOpen(false);
    setQuery("");
  };

  return (
    <div className={styles.searchWrap}>
      <button
        type="button"
        className={styles.searchTrigger}
        onClick={() => setIsOpen(true)}
        aria-label="Open search"
      >
        <SearchGlyph />
        <span className={styles.searchLabel}>Search</span>
        <span className={styles.shortcutHint}>Ctrl K</span>
      </button>

      {isOpen && (
        <div className={styles.overlay} onMouseDown={closeModal}>
          <div
            className={styles.modal}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <span className={styles.modalIcon}>
                <SearchGlyph />
              </span>
              <input
                ref={inputRef}
                type="search"
                className={styles.modalInput}
                placeholder="Search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    closeModal();
                    return;
                  }

                  if (event.key === "ArrowDown" && visibleResults.length > 0) {
                    event.preventDefault();
                    setActiveIndex((idx) =>
                      idx + 1 >= visibleResults.length ? 0 : idx + 1,
                    );
                    return;
                  }

                  if (event.key === "ArrowUp" && visibleResults.length > 0) {
                    event.preventDefault();
                    setActiveIndex((idx) =>
                      idx - 1 < 0 ? visibleResults.length - 1 : idx - 1,
                    );
                    return;
                  }

                  if (event.key === "Enter" && visibleResults.length > 0) {
                    event.preventDefault();
                    openResult(visibleResults[activeIndex].permalink);
                  }
                }}
              />
              <button
                type="button"
                className={styles.escButton}
                onClick={closeModal}
              >
                ESC
              </button>
            </div>

            <div className={styles.resultsPanel}>
              <div className={styles.sectionLabel}>
                {normalizedQuery ? "Results" : "Recommended"}
              </div>

              {visibleResults.length === 0 && (
                <div className={styles.emptyState}>No matches found.</div>
              )}

              {visibleResults.map((result, index) => (
                <button
                  key={result.permalink}
                  type="button"
                  className={`${styles.resultItem} ${
                    index === activeIndex ? styles.resultItemActive : ""
                  }`}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => openResult(result.permalink)}
                >
                  <span className={styles.resultTitle}>{result.title}</span>
                  <span className={styles.resultDescription}>
                    {FEATURED_HINTS[result.docId] || result.docPath}
                  </span>
                </button>
              ))}
            </div>

            <div className={styles.modalFooter}>
              <span>Enter to open</span>
              <span>Up/Down to navigate</span>
              <span>Esc to close</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
