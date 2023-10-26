import React, {
  createContext,
  useState,
  Dispatch,
  SetStateAction,
} from "react";

export type LanguageType = "english" | "spanish";
export const LANGUAGE_SHORT_CODE_MAP = {
  english: "en",
  spanish: "es",
};

export enum LanguageShortcodeMap {
  english = "en",
  spanish = "es",
}

interface LanguageContextType {
  language: LanguageType;
  setLanguage: Dispatch<SetStateAction<LanguageType>>;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

interface LanguageProviderProps {
  children: React.ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
}) => {
  const [language, setLanguage] = useState<LanguageType>("english");

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
