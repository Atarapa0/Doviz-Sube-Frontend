export type DovizFormState = {
  alinacakDoviz: string;
  odenecekDoviz: string;
  alinacakMiktar: string;
  odenecekMiktar: string;
  sonMiktarAlani: "alinacak" | "odenecek";
  hesaplamaHatasi: string;
};

export type DovizFormAction =
  | { type: "ALINACAK_DOVIZ_DEGISTIR"; payload: string }
  | { type: "ODENECEK_DOVIZ_DEGISTIR"; payload: string }
  | { type: "ALINACAK_MIKTAR_GIR"; payload: string }
  | { type: "ODENECEK_MIKTAR_GIR"; payload: string }
  | { type: "ALINACAK_MIKTAR_HESAPLA"; payload: string }
  | { type: "ODENECEK_MIKTAR_HESAPLA"; payload: string }
  | { type: "HESAPLAMA_HATASI_GUNCELLE"; payload: string }
  | { type: "FORMU_TEMIZLE" };

export const initialDovizFormState: DovizFormState = {
  alinacakDoviz: "",
  odenecekDoviz: "",
  alinacakMiktar: "",
  odenecekMiktar: "",
  sonMiktarAlani: "alinacak",
  hesaplamaHatasi: "",
};

export function dovizFormReducer(
  state: DovizFormState,
  action: DovizFormAction,
): DovizFormState {
  switch (action.type) {
    case "ALINACAK_DOVIZ_DEGISTIR":
      return { ...state, alinacakDoviz: action.payload };

    case "ODENECEK_DOVIZ_DEGISTIR":
      return { ...state, odenecekDoviz: action.payload };

    case "ALINACAK_MIKTAR_GIR":
      return {
        ...state,
        alinacakMiktar: action.payload,
        sonMiktarAlani: "alinacak",
      };

    case "ODENECEK_MIKTAR_GIR":
      return {
        ...state,
        odenecekMiktar: action.payload,
        sonMiktarAlani: "odenecek",
      };

    case "ALINACAK_MIKTAR_HESAPLA":
      return { ...state, alinacakMiktar: action.payload };

    case "ODENECEK_MIKTAR_HESAPLA":
      return { ...state, odenecekMiktar: action.payload };

    case "HESAPLAMA_HATASI_GUNCELLE":
      return { ...state, hesaplamaHatasi: action.payload };

    case "FORMU_TEMIZLE":
      return initialDovizFormState;

    default:
      return state;
  }
}
