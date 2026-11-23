/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_SHEET_ID?: string;
  readonly VITE_SHEET_NAME_COLUMN?: string;
  readonly VITE_SHEET_ID_COLUMN?: string;
  readonly VITE_PARTICIPANTS_API_URL?: string;
  readonly VITE_ORGANIZER_PIN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
