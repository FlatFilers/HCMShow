import { useContext } from "react";
import { LanguageContext } from "../../components/language-context";

const useLanguage = () => {
  const context = useContext(LanguageContext);

  return context.language;
};

export default useLanguage;
