import React, {
  createContext,
  useState,
  Dispatch,
  SetStateAction,
  useEffect,
} from "react";

export const SUPPORTED_LANGUAGES = {
  en: "English",
  es: "Spanish",
  de: "German",
  fr: "French",
  it: "Italian",
};

export type SupportedLanguage = keyof typeof SUPPORTED_LANGUAGES;

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: Dispatch<SetStateAction<SupportedLanguage>>;
}

export const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
});

interface LanguageProviderProps {
  children: React.ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
}) => {
  const [language, setLanguage] = useState<SupportedLanguage>("en");

  useEffect(() => {
    const getStoredLanguage = () => {
      if (typeof window !== "undefined") {
        const storedLanguage = localStorage.getItem(
          "language"
        ) as SupportedLanguage;
        return storedLanguage || "en";
      }
      return "en";
    };

    const storedLanguage = getStoredLanguage();
    if (storedLanguage !== language) {
      setLanguage(storedLanguage);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("language", language);
    }
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
