import asyncio
import threading
from types import SimpleNamespace

import pytest

from app.api.copilot import bounded_chat
from app.schemas import CopilotChatResponse


@pytest.mark.asyncio
async def test_timed_out_provider_keeps_capacity_until_worker_finishes():
    release = threading.Event()
    finished = threading.Event()

    def chat(*_, **__):
        release.wait(2)
        finished.set()
        return CopilotChatResponse(reply="Complete")

    slots = asyncio.Semaphore(1)
    try:
        with pytest.raises(TimeoutError):
            await bounded_chat(SimpleNamespace(chat=chat), "question", {}, slots, timeout=0.01)
        assert slots.locked()
    finally:
        release.set()
    await asyncio.to_thread(finished.wait, 2)
    # Acquiring again proves the completion callback released the retained slot.
    await asyncio.wait_for(slots.acquire(), timeout=1)
    slots.release()
