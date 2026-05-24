"use client";

import { useEffect, useState } from "react";

declare global {
  interface Window {
    google: any;
    googleTranslateElementInit: () => void;
  }
}

export function GoogleTranslator() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Check if script is already added
    if (document.getElementById("google-translate-script")) {
      setIsLoaded(true);
      return;
    }

    // Define the global callback
    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "th", // Default language of the site
          includedLanguages: "th,en,zh-CN,lo,my,km", // TH, EN, China, Laos, Myanmar, Cambodia
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false,
        },
        "google_translate_element"
      );
      setIsLoaded(true);
    };

    // Inject the script
    const script = document.createElement("script");
    script.id = "google-translate-script";
    script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    document.body.appendChild(script);

    // Add custom styles for the widget
    const style = document.createElement("style");
    style.innerHTML = `
      .goog-te-gadget-simple {
        background-color: transparent !important;
        border: none !important;
        padding: 0 !important;
        font-size: 14px !important;
        display: flex !important;
        align-items: center !important;
      }
      .goog-te-gadget-simple .goog-te-menu-value {
        color: inherit !important;
      }
      .goog-te-gadget-simple .goog-te-menu-value span {
        text-decoration: none !important; 
        font-weight: 500 !important;
      }
      .goog-te-gadget-icon {
        display: none !important;
      }
      .goog-te-banner-frame {
        display: none !important;
      }
      body {
        top: 0px !important; 
      }
      #google_translate_element {
        margin-right: 16px;
        z-index: 1000;
      }
      .goog-te-menu-frame {
        max-width: none !important;
        width: auto !important;
        box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1) !important;
        border-radius: 0.5rem !important;
      }
      .goog-te-menu2 {
        width: auto !important;
        max-width: none !important;
      }
    `;
    document.head.appendChild(style);

  }, []);

  return (
    <div id="google_translate_element" className={!isLoaded ? "hidden" : ""} />
  );
}
