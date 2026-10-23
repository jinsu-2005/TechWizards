import { describe, expect, it } from "vitest";
import { isUnsupportedScript } from "./voiceInput";

describe("voiceInput script validation", () => {
  it("permits English and Latin script", () => {
    expect(isUnsupportedScript("What is the status of LIT101?")).toBe(false);
    expect(isUnsupportedScript("LIT101 sensor status enna?")).toBe(false);
    expect(isUnsupportedScript("Vanakkam, system check pannunga")).toBe(false);
  });

  it("permits Tamil script", () => {
    expect(isUnsupportedScript("சென்சார் நிலை என்ன?")).toBe(false);
    expect(isUnsupportedScript("நிகழ்வு குறித்த தகவல்களைக் கூறுங்கள்.")).toBe(false);
  });

  it("identifies unsupported scripts", () => {
    // Hindi (Devanagari)
    expect(isUnsupportedScript("क्या स्थिति है?")).toBe(true);
    // Telugu
    expect(isUnsupportedScript("సిస్టమ్ ఎలా ఉంది?")).toBe(true);
    // Malayalam
    expect(isUnsupportedScript("സിസ്റ്റം എങ്ങനെയുണ്ട്?")).toBe(true);
    // Kannada
    expect(isUnsupportedScript("ವ್ಯವಸ್ಥೆ ಹೇಗಿದೆ?")).toBe(true);
    // Arabic
    expect(isUnsupportedScript("ما هي حالة النظام؟")).toBe(true);
    // Cyrillic
    expect(isUnsupportedScript("Каков статус системы?")).toBe(true);
  });
});
