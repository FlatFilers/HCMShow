import { GlobeAltIcon } from "@heroicons/react/24/outline";
import { useContext } from "react";
import {
  LanguageContext,
  SUPPORTED_LANGUAGES,
  SupportedLanguage,
} from "./language-context";

export default function LanguageSwitcher() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }

  const { language, setLanguage } = context;

  const handleLanguageChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setLanguage(event.target.value as SupportedLanguage);
  };

  return (
    <div className="flex flex-row items-center text-white bg-[#2e323c99] px-2 rounded-lg">
      <GlobeAltIcon className="h-6 w-6" />

      <select value={language} onChange={handleLanguageChange}>
        {Object.entries(SUPPORTED_LANGUAGES).map(([code, label]) => (
          <option key={code} value={code}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
}
