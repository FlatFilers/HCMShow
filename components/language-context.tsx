import React, {
  createContext,
  useState,
  Dispatch,
  SetStateAction,
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

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
