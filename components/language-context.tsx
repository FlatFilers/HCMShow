import React, {
  createContext,
  useState,
  Dispatch,
  SetStateAction,
} from "react";

interface LanguageContextType {
  language: "english" | "spanish";
  setLanguage: Dispatch<SetStateAction<"english" | "spanish">>;
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
  const [language, setLanguage] = useState<"english" | "spanish">("english");

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
