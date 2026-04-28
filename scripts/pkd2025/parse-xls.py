"""Parse StrukturaPKD2025.xls (GUS) into normalized JSON.

Hierarchy in the XLS (cols A..E):
  A=Dział (e.g. "01"), B=Grupa (e.g. "01.1"), C=Klasa (e.g. "01.11"),
  D=Podklasa (e.g. "01.11.Z"), E=Nazwa grupowania
Section markers appear as: A="SEKCJA A", C="ROLNICTWO ...".

Outputs:
  pkd2025-codes.json      - flat list of subclasses with hierarchy context
  pkd2025-hierarchy.json  - sections > divisions > groups > classes > subclasses
"""
import json
import re
from pathlib import Path

import xlrd

XLS_PATH = Path(__file__).parent / "StrukturaPKD2025.xls"
OUT_DIR = Path(__file__).parent

SECTION_RE = re.compile(r"^SEKCJA\s+([A-Z])$")


def main() -> None:
    wb = xlrd.open_workbook(str(XLS_PATH))
    sh = wb.sheet_by_index(0)

    sections: list[dict] = []
    cur_section: dict | None = None
    cur_division: dict | None = None
    cur_group: dict | None = None
    cur_class: dict | None = None
    flat_subclasses: list[dict] = []

    def ensure_group(group_code: str) -> dict:
        """Auto-create a group row if XLS skipped the Grupa level (divisions with one group)."""
        nonlocal cur_group
        assert cur_division is not None
        if cur_group and cur_group["code"] == group_code:
            return cur_group
        # try to find existing group with same code in current division
        for g in cur_division["groups"]:
            if g["code"] == group_code:
                cur_group = g
                return g
        cur_group = {"code": group_code, "name": "", "classes": [], "_synthetic": True}
        cur_division["groups"].append(cur_group)
        return cur_group

    for r in range(2, sh.nrows):  # skip title + header
        a, b, c, d, e = (str(sh.cell_value(r, i)).strip() for i in range(5))

        if not any((a, b, c, d, e)):
            continue

        # SECTION row: A="SEKCJA X", C=name
        if (m := SECTION_RE.match(a)):
            cur_section = {
                "letter": m.group(1),
                "name": c,
                "divisions": [],
            }
            sections.append(cur_section)
            cur_division = cur_group = cur_class = None
            continue

        # DIVISION: A=2-digit code (may coexist with B/C/D on same row)
        if a and re.fullmatch(r"\d{2}", a):
            cur_division = {"code": a, "name": e if not (b or c or d) else "", "groups": []}
            assert cur_section is not None
            cur_section["divisions"].append(cur_division)
            cur_group = cur_class = None
            # fall through: row may also carry B/C/D info

        # GROUP: B=NN.N
        if b and re.fullmatch(r"\d{2}\.\d", b):
            # check if group already exists (e.g. created on division-fall-through earlier)
            existing = None
            assert cur_division is not None
            for g in cur_division["groups"]:
                if g["code"] == b:
                    existing = g
                    break
            if existing:
                cur_group = existing
                if not cur_group.get("name") and not (c or d):
                    cur_group["name"] = e
            else:
                cur_group = {"code": b, "name": e if not (c or d) else "", "classes": []}
                cur_division["groups"].append(cur_group)
            cur_class = None
            # fall through: row may also carry C/D info

        # CLASS: C=NN.NN
        if c and re.fullmatch(r"\d{2}\.\d{2}", c):
            group_code = f"{c[:2]}.{c[3]}"
            ensure_group(group_code)
            existing = None
            assert cur_group is not None
            for cl in cur_group["classes"]:
                if cl["code"] == c:
                    existing = cl
                    break
            if existing:
                cur_class = existing
                if not cur_class.get("name") and not d:
                    cur_class["name"] = e
            else:
                cur_class = {"code": c, "name": e if not d else "", "subclasses": []}
                cur_group["classes"].append(cur_class)
            # fall through: row may also carry D info (subclass)

        # SUBCLASS: D=NN.NN.X
        if d and re.fullmatch(r"\d{2}\.\d{2}\.[A-Z]", d):
            class_code = d[:5]
            group_code = f"{d[:2]}.{d[3]}"
            ensure_group(group_code)

            if cur_class is None or cur_class["code"] != class_code:
                # synthesize class if missing
                assert cur_group is not None
                found = next((cl for cl in cur_group["classes"] if cl["code"] == class_code), None)
                if found:
                    cur_class = found
                else:
                    cur_class = {"code": class_code, "name": "", "subclasses": [], "_synthetic": True}
                    cur_group["classes"].append(cur_class)

            assert cur_class is not None and cur_section is not None and cur_division is not None and cur_group is not None
            sub = {"code": d, "name": e}
            cur_class["subclasses"].append(sub)
            # promote class name from subclass row if class name still empty (single-subclass case)
            if not cur_class.get("name"):
                cur_class["name"] = e
            flat_subclasses.append({
                "code": d,
                "name": e,
                "section": cur_section["letter"],
                "sectionName": cur_section["name"],
                "division": cur_division["code"],
                "divisionName": cur_division["name"],
                "group": cur_group["code"],
                "groupName": cur_group["name"] or cur_class["name"],
                "class": cur_class["code"],
                "className": cur_class["name"],
            })

    (OUT_DIR / "pkd2025-hierarchy.json").write_text(
        json.dumps(sections, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    (OUT_DIR / "pkd2025-codes.json").write_text(
        json.dumps(flat_subclasses, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    print(f"sections:    {len(sections)}")
    print(f"divisions:   {sum(len(s['divisions']) for s in sections)}")
    print(f"groups:      {sum(len(d['groups']) for s in sections for d in s['divisions'])}")
    print(
        "classes:     "
        f"{sum(len(c['classes']) for s in sections for d in s['divisions'] for c in d['groups'])}"
    )
    print(f"subclasses:  {len(flat_subclasses)}")
    print(f"wrote: {OUT_DIR / 'pkd2025-hierarchy.json'}")
    print(f"wrote: {OUT_DIR / 'pkd2025-codes.json'}")


if __name__ == "__main__":
    main()
