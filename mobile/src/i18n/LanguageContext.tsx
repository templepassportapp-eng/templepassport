import React, {createContext, useCallback, useContext, useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import strings, {LangCode, StringKey} from './strings';

interface LangContextType {
  lang:    LangCode;
  setLang: (code: LangCode) => Promise<void>;
  t:       (key: StringKey) => string;
}

const LangContext = createContext<LangContextType>({
  lang: 'en',
  setLang: async () => {},
  t: key => strings.en[key],
});

export function LanguageProvider({children}: {children: React.ReactNode}) {
  const [lang, setLangState] = useState<LangCode>('en');

  useEffect(() => {
    AsyncStorage.getItem('tp_language')
      .then(v => { if (v === 'hi') setLangState('hi'); })
      .catch(() => {});
  }, []);

  const setLang = useCallback(async (code: LangCode) => {
    await AsyncStorage.setItem('tp_language', code).catch(() => {});
    setLangState(code);
  }, []);

  const t = useCallback((key: StringKey) => strings[lang][key], [lang]);

  return (
    <LangContext.Provider value={{lang, setLang, t}}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
