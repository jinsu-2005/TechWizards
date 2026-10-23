"""Strict language validation and policy enforcement for AttackTrace voice systems.

Supported languages:
- English (en)
- Tamil (ta)
- Tanglish (tanglish) - Tamil mixed with English technical terms or conversational code-switching.

Unsupported languages (Hindi, Malayalam, Telugu, Kannada, etc.) are strictly rejected.
"""

from __future__ import annotations

from dataclasses import dataclass
import re
import unicodedata
from typing import Sequence

# Unicode ranges for unsupported non-Tamil Indic scripts
UNSUPPORTED_SCRIPT_RANGES = [
    ("\u0900", "\u097F", "Devanagari (Hindi/Marathi)"),
    ("\u0980", "\u09FF", "Bengali"),
    ("\u0A00", "\u0A7F", "Gurmukhi (Punjabi)"),
    ("\u0A80", "\u0AFF", "Gujarati"),
    ("\u0B00", "\u0B7F", "Oriya"),
    ("\u0C00", "\u0C7F", "Telugu"),
    ("\u0C80", "\u0CFF", "Kannada"),
    ("\u0D00", "\u0D7F", "Malayalam"),
    ("\u0D80", "\u0DFF", "Sinhala"),
    ("\u0600", "\u06FF", "Arabic/Urdu"),
    ("\u0400", "\u04FF", "Cyrillic"),
    ("\u4E00", "\u9FFF", "CJK Unified Ideographs"),
    ("\u3040", "\u30FF", "Japanese Kana"),
    ("\uAC00", "\uD7AF", "Korean Hangul"),
    ("\u0E00", "\u0E7F", "Thai"),
]

# Tamil script Unicode range: U+0B80 to U+0BFF
TAMIL_SCRIPT_MIN = "\u0B80"
TAMIL_SCRIPT_MAX = "\u0BFF"

# Common romanized Tanglish tokens (Tamil words in Latin transliteration)
TANGLISH_VOCABULARY = frozenset({
    "vanakkam", "sari", "seri", "aama", "aamam", "illai", "illa", "ille", "paravalla",
    "nandri", "enna", "edhu", "ethu", "epdi", "eppadi", "enga", "enga", "eppo",
    "yaaru", "yen", "yaen", "inga", "enga", "anga", "idhu", "adhu", "ithu", "athu",
    "ippo", "appo", "ippadi", "appadi", "ivanga", "avanga", "irukku", "irukka",
    "iruku", "iruka", "irunthuchu", "pannunga", "pannu", "pannalam", "sollunga",
    "solunga", "solli", "paaru", "pathu", "paarkalam", "theriyuma", "theriyala",
    "puriyala", "puriyudha", "mudiyuma", "mudiyadhu", "vaanga", "ponga", "kudunga",
    "aachu", "aayidichu", "romba", "konjam", "nalla", "thappa", "kooda", "mattum",
    "thavira", "solren", "solra", "theriyum", "enaku", "unaku", "ungalaala",
    "ungalku", "ungalukku", "solla", "mudiyum", "check-pannunga", "status-enna",
})

# Tanglish suffixes typically attached to English or Tamil words
TANGLISH_SUFFIXES = ("-la", "-le", "-oda", "-ah", "-aa", "-unga", "-ingala", "-aachu", "-la?")

# Romanized unsupported Indic stopwords (Hindi, Telugu, Malayalam, Kannada)
ROMANIZED_HINDI = frozenset({
    "kya", "kyun", "kaise", "kahan", "kab", "kripya", "kripaya", "mujhe", "tumhe",
    "aapka", "apka", "humara", "hamara", "nahin", "nahi", "batao", "bataiye",
    "accha", "theek", "shukriya", "dhanyavad", "namaste", "karo", "kijiye",
    "kuch", "hota", "hoga", "hain", "bolo", "samajh", "chahiye", "dekho",
})

ROMANIZED_TELUGU = frozenset({
    "enti", "ela", "unnaru", "unnara", "cheppandi", "chudandi", "ledu", "kadu",
    "ikkada", "ekkada", "emiti", "meeru", "nenu", "bagunara", "cheppali",
})

ROMANIZED_MALAYALAM = frozenset({
    "entha", "engane", "undu", "undo", "parayu", "nokku", "illa", "alla",
    "evide", "ivide", "samsarikkumo", "ariyilla", "manasilayo",
})

ROMANIZED_KANNADA = frozenset({
    "enu", "hege", "ide", "idhe", "heli", "nodi", "illa", "alla",
    "elli", "illi", "gotthilla", "gottilla", "beku",
})

ALL_ROMANIZED_UNSUPPORTED = (
    ROMANIZED_HINDI | ROMANIZED_TELUGU | ROMANIZED_MALAYALAM | ROMANIZED_KANNADA
)

# Common SCADA / AttackTrace domain terms and English structural tokens
DOMAIN_AND_ENGLISH_TOKENS = frozenset({
    "status", "sensor", "anomalies", "anomaly", "incident", "incidents",
    "reading", "readings", "tank", "valve", "pump", "level", "pressure",
    "flow", "lit101", "fit101", "ait201", "plc1", "plc2", "attacktrace",
    "system", "evidence", "origin", "hypothesis", "candidate", "investigation",
    "what", "is", "are", "the", "show", "explain", "check", "tell", "me",
    "about", "how", "why", "yes", "no", "help", "hello", "hi", "pilot",
    "monitoring", "digital", "twin", "active", "simulation", "replay", "modbus",
    "hai", "sim", "live", "anomalous", "unconfirmed", "metrics", "alerts",
})

UNSUPPORTED_LANGUAGE_MESSAGE = "Please speak in English or Tamil."


@dataclass(frozen=True)
class LanguageClassification:
    language: str  # "en", "ta", "tanglish", "unsupported"
    is_supported: bool
    confidence: float
    reason: str


def has_tamil_characters(text: str) -> bool:
    """True if text contains at least one character in Tamil Unicode block."""
    return any(TAMIL_SCRIPT_MIN <= ch <= TAMIL_SCRIPT_MAX for ch in text)


def detect_unsupported_script(text: str) -> str | None:
    """Return the name of an unsupported script if detected in text, else None."""
    for ch in text:
        for start, end, name in UNSUPPORTED_SCRIPT_RANGES:
            if start <= ch <= end:
                return name
    return None


def tokenize_words(text: str) -> list[str]:
    """Tokenize lowercase words/alphanumeric tokens from text."""
    clean = re.sub(r"[^\w\s-]", " ", text.lower())
    return [w for w in clean.split() if w]


def classify_language(text: str) -> LanguageClassification:
    """Classify input text according to AttackTrace strict language policy.

    Allowed:
    - "en": English speech / standard domain commands
    - "ta": Tamil in Tamil script
    - "tanglish": Tamil mixed with English or transliterated Tamil
    - "unsupported": Speech detected as Hindi, Malayalam, Telugu, Kannada, or other unsupported languages
    """
    if not text or not text.strip():
        return LanguageClassification("en", is_supported=True, confidence=1.0, reason="empty_default")

    # 1. Check for explicit unsupported scripts (Devanagari, Telugu, Malayalam, Kannada, Arabic, etc.)
    unsupported_script = detect_unsupported_script(text)
    if unsupported_script:
        return LanguageClassification(
            language="unsupported",
            is_supported=False,
            confidence=1.0,
            reason=f"unsupported_script:{unsupported_script}",
        )

    # 2. Check for Tamil script
    if has_tamil_characters(text):
        tokens = tokenize_words(text)
        has_latin = any(re.search(r"[a-z0-9]", t) for t in tokens)
        if has_latin:
            return LanguageClassification(
                language="tanglish",
                is_supported=True,
                confidence=0.98,
                reason="tamil_script_with_latin",
            )
        return LanguageClassification(
            language="ta",
            is_supported=True,
            confidence=1.0,
            reason="tamil_script_pure",
        )

    # 3. Text is predominantly Latin/alphanumeric. Inspect romanized tokens.
    tokens = tokenize_words(text)
    if not tokens:
        return LanguageClassification("en", is_supported=True, confidence=1.0, reason="default_en")

    unsupported_matches = [t for t in tokens if t in ALL_ROMANIZED_UNSUPPORTED]
    tanglish_matches = [
        t for t in tokens
        if t in TANGLISH_VOCABULARY or any(t.endswith(suf) for suf in TANGLISH_SUFFIXES if len(t) > len(suf) + 2)
    ]
    english_or_domain_matches = [t for t in tokens if t in DOMAIN_AND_ENGLISH_TOKENS]

    # Strong unsupported signal: romanized stopwords without Tamil context
    if unsupported_matches and not tanglish_matches:
        if len(unsupported_matches) >= 2 or (len(unsupported_matches) >= 1 and not english_or_domain_matches):
            return LanguageClassification(
                language="unsupported",
                is_supported=False,
                confidence=0.9,
                reason=f"romanized_unsupported_tokens:{','.join(unsupported_matches[:3])}",
            )

    # Tanglish detection: presence of Tanglish markers
    if tanglish_matches:
        return LanguageClassification(
            language="tanglish",
            is_supported=True,
            confidence=0.92,
            reason=f"tanglish_tokens:{','.join(tanglish_matches[:3])}",
        )

    # Default to English (per Section 5: prefer English by default when no reliable Tamil signal exists)
    return LanguageClassification(
        language="en",
        is_supported=True,
        confidence=0.85,
        reason="english_or_domain_default",
    )


def is_self_echo(user_text: str, recent_assistant_texts: Sequence[str]) -> bool:
    """Detect if incoming speech transcription is an echo of the assistant's own recent output.

    Prevents acoustic bleed or feedback loops from triggering false user speech turns.
    """
    if not user_text or not recent_assistant_texts:
        return False

    norm_user = " ".join(tokenize_words(user_text))
    if len(norm_user) < 8:
        # Very short phrases like 'yes', 'no' shouldn't be falsely flagged as echo
        return False

    user_words = set(norm_user.split())
    if len(user_words) < 3:
        return False

    for assistant_raw in reversed(recent_assistant_texts[-3:]):
        norm_assistant = " ".join(tokenize_words(assistant_raw))
        if not norm_assistant:
            continue
        # Direct substring match
        if norm_user in norm_assistant or norm_assistant in norm_user:
            return True
        # High word intersection match (> 75%)
        assistant_words = set(norm_assistant.split())
        if not assistant_words:
            continue
        common = user_words.intersection(assistant_words)
        overlap = len(common) / len(user_words)
        if overlap >= 0.75 and len(common) >= 3:
            return True

    return False


def sanitize_response_text(assistant_text: str) -> str:
    """Ensure assistant response adheres strictly to the language policy.

    If an unsupported language is present in model output, sanitizes to the standard policy message.
    """
    classification = classify_language(assistant_text)
    if not classification.is_supported:
        return UNSUPPORTED_LANGUAGE_MESSAGE
    return assistant_text
