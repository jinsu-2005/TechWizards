"""Unit tests for AttackTrace Live Voice language control and policy enforcement."""

from app.ai.language import (
    UNSUPPORTED_LANGUAGE_MESSAGE,
    classify_language,
    is_self_echo,
    sanitize_response_text,
)


def test_classify_english_speech() -> None:
    queries = [
        "What is the status of LIT101?",
        "Show me all anomalies in simulation mode.",
        "Explain the leading origin hypothesis for the open incident.",
        "Check tank levels and valve positions.",
        "hello",
        "yes",
        "no",
    ]
    for q in queries:
        result = classify_language(q)
        assert result.is_supported is True
        assert result.language == "en", f"Expected 'en' for: {q}, got: {result.language}"


def test_classify_tamil_script() -> None:
    tamil_queries = [
        "சென்சார் நிலை என்ன?",
        "ஏதேனும் முரண்பாடுகள் உள்ளதா?",
        "நிகழ்வு குறித்த தகவல்களைக் கூறுங்கள்.",
    ]
    for q in tamil_queries:
        result = classify_language(q)
        assert result.is_supported is True
        assert result.language in ("ta", "tanglish"), f"Expected Tamil for: {q}"


def test_classify_tanglish_speech() -> None:
    tanglish_queries = [
        "LIT101 sensor status enna?",
        "Anomalies ethavathu iruka?",
        "Incident pathi solunga",
        "Vanakkam, system check pannunga",
        "Tank level epdi irukku?",
        "Romba anomalous-ah iruka?",
    ]
    for q in tanglish_queries:
        result = classify_language(q)
        assert result.is_supported is True
        assert result.language == "tanglish", f"Expected 'tanglish' for: {q}, got: {result.language}"


def test_classify_unsupported_indic_scripts() -> None:
    # Hindi (Devanagari)
    hindi = "क्या कोई विसंगति है? स्थिति बताओ"
    res = classify_language(hindi)
    assert res.is_supported is False
    assert res.language == "unsupported"

    # Telugu
    telugu = "సిస్టమ్ ఎలా ఉంది? ఏదైనా సమస్య ఉందా?"
    res = classify_language(telugu)
    assert res.is_supported is False
    assert res.language == "unsupported"

    # Malayalam
    malayalam = "എന്തെങ്കിലും പ്രശ്നമുണ്ടോ? സിസ്റ്റം എങ്ങനെയുണ്ട്?"
    res = classify_language(malayalam)
    assert res.is_supported is False
    assert res.language == "unsupported"

    # Kannada
    kannada = "ವ್ಯವಸ್ಥೆ ಹೇಗಿದೆ? ಏನಾದರೂ ಸಮಸ್ಯೆ ಇದೆಯೇ?"
    res = classify_language(kannada)
    assert res.is_supported is False
    assert res.language == "unsupported"


def test_classify_romanized_unsupported_languages() -> None:
    # Romanized Hindi
    hindi_roman = "kya koi problem hai mujhe batao"
    res = classify_language(hindi_roman)
    assert res.is_supported is False
    assert res.language == "unsupported"

    # Romanized Telugu
    telugu_roman = "enti samasya ikkada cheppandi"
    res = classify_language(telugu_roman)
    assert res.is_supported is False
    assert res.language == "unsupported"

    # Romanized Malayalam
    malayalam_roman = "entha prashnam evide parayu"
    res = classify_language(malayalam_roman)
    assert res.is_supported is False
    assert res.language == "unsupported"

    # Romanized Kannada
    kannada_roman = "enu samasye elli heli"
    res = classify_language(kannada_roman)
    assert res.is_supported is False
    assert res.language == "unsupported"


def test_self_echo_detection() -> None:
    assistant_history = [
        "AI Pilot is watching simulation. No active incident is reported.",
        "LIT101 reading is 52.0 and normal.",
    ]

    # Substring echo
    assert is_self_echo("AI Pilot is watching simulation", assistant_history) is True
    assert is_self_echo("watching simulation No active incident is reported", assistant_history) is True
    assert is_self_echo("LIT101 reading is 52.0 and normal", assistant_history) is True

    # Genuine user speech must NOT be flagged as echo
    assert is_self_echo("What about pump P101?", assistant_history) is False
    assert is_self_echo("Can you explain the anomaly?", assistant_history) is False
    assert is_self_echo("yes", assistant_history) is False
    assert is_self_echo("ok", assistant_history) is False


def test_sanitize_response_text() -> None:
    # Supported responses remain untouched
    en_resp = "I am watching Modbus monitoring. Readings are stable."
    assert sanitize_response_text(en_resp) == en_resp

    tanglish_resp = "LIT101 reading 52.0 irukku. Incident onnum illa."
    assert sanitize_response_text(tanglish_resp) == tanglish_resp

    # Unsupported responses get sanitized to standard policy message
    hindi_resp = "यह सिमुलेशन मोड में चल रहा है"
    assert sanitize_response_text(hindi_resp) == UNSUPPORTED_LANGUAGE_MESSAGE
