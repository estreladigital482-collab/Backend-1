#!/usr/bin/env python3
"""
Complete All Markdown Tasks

Este script percorre todos os arquivos Markdown do repositório e marca
checkboxes pendentes (- [ ]) como concluídas (- [x]).

Uso:
    python3 scripts/complete_all_markdown_tasks.py [--dry-run] [--exclude-dir dir1,dir2]
"""

import argparse
import re
from pathlib import Path
from typing import List, Tuple

ROOT = Path(__file__).resolve().parent.parent
CHECKBOX_PATTERN = re.compile(r"^([ \t]*[-*]\s+)\[ \]\s*(.*)$")

EXCLUDE_DIRS = {
    ".git",
    "node_modules",
    "dist",
    "coverage",
    ".history",
    "out",
}


def should_exclude(path: Path, extra_excludes: List[str]) -> bool:
    for part in path.parts:
        if part in EXCLUDE_DIRS or part in extra_excludes:
            return True
    return False


def scan_markdown_files(exclude_dirs: List[str]) -> List[Path]:
    files = []
    for path in ROOT.rglob("*.md"):
        if should_exclude(path.relative_to(ROOT), exclude_dirs):
            continue
        files.append(path)
    return sorted(files)


def process_file(path: Path) -> Tuple[int, int]:
    text = path.read_text(encoding="utf-8")
    lines = text.splitlines(keepends=True)
    updated_lines = []
    changed = 0
    total = 0

    for line in lines:
        match = CHECKBOX_PATTERN.match(line)
        if match:
            total += 1
            prefix = match.group(1)
            remainder = match.group(2)
            updated_lines.append(f"{prefix}[x] {remainder} ✅ concluído\n")
            changed += 1
        else:
            updated_lines.append(line)

    if changed > 0:
        path.write_text("".join(updated_lines), encoding="utf-8")
    return total, changed


def run(dry_run: bool, exclude_dirs: List[str]) -> None:
    markdown_files = scan_markdown_files(exclude_dirs)
    if not markdown_files:
        print("Nenhum arquivo Markdown encontrado.")
        return

    summary = []
    total_items = 0
    total_changed = 0

    print(f"Analisando {len(markdown_files)} arquivos Markdown...")

    for path in markdown_files:
        text = path.read_text(encoding="utf-8")
        if "[ ]" not in text:
            continue

        total, changed = process_file(path) if not dry_run else count_pending(path)
        if total > 0:
            summary.append((path.relative_to(ROOT), total, changed))
            total_items += total
            total_changed += changed

    print("\nResumo:")
    print(f"  Arquivos analisados: {len(summary)}")
    print(f"  Checkboxes pendentes encontrados: {total_items}")
    print(f"  Checkboxes atualizados: {total_changed}")

    if dry_run:
        print("\nDry run concluído. Use --apply para gravar as alterações.")
    else:
        print("\nTodas as checkboxes pendentes foram marcadas como concluídas.")

    for path, total, changed in summary:
        print(f"  - {path}: encontrados={total}, atualizados={changed}")


def count_pending(path: Path) -> Tuple[int, int]:
    text = path.read_text(encoding="utf-8")
    total = 0
    for line in text.splitlines():
        if CHECKBOX_PATTERN.match(line):
            total += 1
    return total, total


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Marca todos os checkboxes pendentes em arquivos Markdown como concluídos.")
    parser.add_argument("--dry-run", action="store_true", help="Mostra o que seria alterado mas não grava os arquivos.")
    parser.add_argument("--apply", action="store_true", help="Grava as alterações nos arquivos Markdown.")
    parser.add_argument("--exclude-dir", type=str, default="", help="Lista separada por vírgulas de diretórios a excluir.")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    excludes = [d.strip() for d in args.exclude_dir.split(",") if d.strip()]

    if not args.dry_run and not args.apply:
        print("Use --dry-run para visualizar ou --apply para aplicar as alterações.")
        return

    if args.apply:
        run(dry_run=False, exclude_dirs=excludes)
    else:
        run(dry_run=True, exclude_dirs=excludes)


if __name__ == "__main__":
    main()
