"""Tests for validate_squad. Runs under pytest, or standalone: `python scripts/test_validate_squad.py`.

Coverage: 1 happy path + 3 failure modes (missing section, dangling ref, roster drift).
"""
from __future__ import annotations

import shutil
import sys
import tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from validate_squad import validate  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]


def _clone(tmp: Path) -> Path:
    """Minimal valid squad copy (everything validate() reads), no .git/product/state."""
    dst = tmp / "squad"
    (dst / ".claude").mkdir(parents=True)
    shutil.copytree(ROOT / ".claude" / "agents", dst / ".claude" / "agents")
    shutil.copytree(ROOT / ".claude" / "skills", dst / ".claude" / "skills")
    shutil.copy(ROOT / "CONTRACT.md", dst / "CONTRACT.md")
    shutil.copytree(ROOT / "memory", dst / "memory")
    shutil.copytree(ROOT / "brand", dst / "brand")
    return dst


def test_real_squad_is_valid():
    assert validate(ROOT) == [], "the committed squad must satisfy every invariant"


def test_missing_section_is_caught(tmp_path):
    dst = _clone(tmp_path)
    agent = dst / ".claude" / "agents" / "qa-sweeper.md"
    agent.write_text(agent.read_text().replace("## Voice", "## Vibe"))
    assert any("Voice" in e for e in validate(dst))


def test_dangling_template_ref_is_caught(tmp_path):
    dst = _clone(tmp_path)
    (dst / ".claude" / "skills" / "prod-squad" / "templates" / "prd.md").unlink()
    assert any("prd.md" in e for e in validate(dst))


def test_roster_drift_is_caught(tmp_path):
    dst = _clone(tmp_path)
    (dst / ".claude" / "agents" / "rogue-agent.md").write_text("---\nname: Rogue\n---\n")
    assert any("rogue-agent" in e for e in validate(dst))


def _run_standalone() -> int:
    """Fallback runner when pytest isn't installed."""
    passed = failed = 0
    test_real_squad_is_valid_failed = False
    # happy path (no fixture)
    try:
        test_real_squad_is_valid()
        print("  ✓ test_real_squad_is_valid")
        passed += 1
    except AssertionError as e:
        print(f"  ✗ test_real_squad_is_valid: {e}")
        failed += 1
    # fixtured tests
    for fn in (test_missing_section_is_caught, test_dangling_template_ref_is_caught, test_roster_drift_is_caught):
        with tempfile.TemporaryDirectory() as td:
            try:
                fn(Path(td))
                print(f"  ✓ {fn.__name__}")
                passed += 1
            except AssertionError as e:
                print(f"  ✗ {fn.__name__}: {e}")
                failed += 1
    print(f"\n{passed} passed, {failed} failed")
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(_run_standalone())
