'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    google: any;
    googleTranslateElementInit: () => void;
  }
}

export default function GoogleTranslate() {
  useEffect(() => {
    // Check if script already exists
    if (document.getElementById('google-translate-script')) return;

    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        { 
          pageLanguage: 'en',
          autoDisplay: false,
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE
        },
        'google_translate_element'
      );
    };

    const script = document.createElement('script');
    script.id = 'google-translate-script';
    script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    document.body.appendChild(script);

    // Hide the top banner frame explicitly via a style tag injection
    const style = document.createElement('style');
    style.innerHTML = `
      body { top: 0 !important; }
      .skiptranslate iframe, .goog-te-banner-frame { display: none !important; }
      #google_translate_element select {
          padding: 4px 8px;
          border-radius: 8px;
          background: rgba(0,0,0,0.5);
          color: #a1a1aa;
          border: 1px solid rgba(255,255,255,0.1);
          font-size: 10px;
          font-weight: 900;
          text-transform: uppercase;
          outline: none;
      }
      .goog-te-gadget { color: transparent !important; }
      .goog-te-gadget span { display: none; }
    `;
    document.head.appendChild(style);

  }, []);

  return (
    <div id="google_translate_element" className="fixed top-24 right-5 md:right-8 z-[90] scale-90 opacity-40 hover:opacity-100 transition-opacity"></div>
  );
}
