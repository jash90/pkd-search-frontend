export interface PKDCode {
  id: string;
  version: number;
  score: number;
  payload: {
    grupaKlasaPodklasa: string;
    nazwaGrupowania: string;
    opisDodatkowy: string;
  };
}

export interface SearchResponse {
  aiSuggestion: PKDCode;
  pkdCodeData: PKDCode[];
}
