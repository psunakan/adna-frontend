#!/usr/bin/env python3
"""Parse legacy TSV exports and generate Supabase seed SQL."""

from __future__ import annotations

import json
import re
import sys
from collections import defaultdict
from pathlib import Path

BACKUP_DIR = Path.home() / 'Downloads/sql-database-backup-local'
OUTPUT = Path(__file__).resolve().parent.parent / 'supabase/seed/legacy_membership_data.sql'

MEMBERSHIP_TYPE_IDS = {
    'premium': '56f6be17-ebcd-43ca-9dc6-0e2545e88cac',
    'diaspora': 'd8e37c51-aee6-4f6b-82be-b4bf613cf3ad',
    'regular': 'b9aabd89-7ea5-4da2-aa66-ef09dfb7b4a0',
    'professional': 'd8e37c51-aee6-4f6b-82be-b4bf613cf3ad',
}


def sql_str(value: str | None) -> str:
    if value is None or value == '' or value.upper() == 'NULL':
        return 'null'
    return "'" + value.replace("'", "''") + "'"


def sql_bool(value: str | bool | None) -> str:
    if isinstance(value, bool):
        return 'true' if value else 'false'
    if value is None:
        return 'false'
    return 'true' if str(value).lower() in ('1', 'true', 'yes') else 'false'


def sql_array_from_raw(raw: str | None) -> str:
    if not raw or raw.upper() == 'NULL':
        return 'array[]::text[]'
    raw = raw.strip()
    if raw.startswith('['):
        try:
            items = json.loads(raw)
            if isinstance(items, list):
                escaped = [item.replace("'", "''") for item in items if isinstance(item, str)]
                if escaped:
                    return 'array[' + ', '.join(sql_str(item) for item in escaped) + ']::text[]'
        except json.JSONDecodeError:
            pass
    cleaned = raw.strip('"').strip()
    if not cleaned:
        return 'array[]::text[]'
    return f'array[{sql_str(cleaned)}]::text[]'


def parse_membership_type_id(alias: str | None, explicit_id: str | None) -> str | None:
    if explicit_id and explicit_id.upper() != 'NULL':
        return explicit_id.lower()
    if not alias:
        return None
    return MEMBERSHIP_TYPE_IDS.get(alias.strip().lower())


def read_optional_datetime(tokens: list[str], index: int) -> tuple[str | None, int]:
    if index >= len(tokens) or tokens[index].upper() == 'NULL':
        return None, index + 1
    if index + 1 < len(tokens) and re.match(r'^\d{2}:\d{2}:\d{2}', tokens[index + 1]):
        return f'{tokens[index]} {tokens[index + 1]}', index + 2
    return tokens[index], index + 1


def parse_membership_row(line: str) -> dict | None:
    email_match = re.search(r'[\w.+-]+@[\w.-]+\.\w+', line)
    if not email_match:
        return None

    email = email_match.group(0)
    before = line[: email_match.start()].strip()
    after = line[email_match.end() :].strip()

    id_match = re.match(r'^([0-9A-F-]{36})\s+', before, re.I)
    if not id_match:
        return None

    member_id = id_match.group(1).lower()
    rest = before[id_match.end() :].strip()

    phone_match = re.search(r'(\+\d[\d\s-]{6,})\s+([A-Z]{2,3})\s*$', rest)
    if not phone_match:
        return None

    phone = phone_match.group(1).replace(' ', '')
    country_residence = phone_match.group(2)
    names_part = rest[: phone_match.start()].strip()
    title_match = re.match(r'^(\S+)\s+(.*)$', names_part)
    if not title_match:
        return None

    title = title_match.group(1)
    name_rest = title_match.group(2).strip()
    if ' ' in name_rest:
        first_name, last_name = name_rest.rsplit(' ', 1)
    else:
        first_name, last_name = name_rest, ''

    tokens = after.split()
    if len(tokens) < 20:
        return None

    idx = 0
    is_student = tokens[idx].lower() == 'yes'
    idx += 1
    password_hash = tokens[idx]
    idx += 1
    password_salt = tokens[idx]
    idx += 1
    status = int(tokens[idx]); idx += 1
    is_active = tokens[idx] == '1'; idx += 1
    invalid_login_attempts = int(tokens[idx]); idx += 1
    is_locked = tokens[idx] == '1'; idx += 1
    lockout_end_at, idx = read_optional_datetime(tokens, idx)
    last_login_at, idx = read_optional_datetime(tokens, idx)
    deactivated = tokens[idx] == '1'; idx += 1
    deactivated_at, idx = read_optional_datetime(tokens, idx)
    deactivated_by = None if tokens[idx].upper() == 'NULL' else tokens[idx]
    idx += 1
    created_at, idx = read_optional_datetime(tokens, idx)
    if not created_at:
        return None

    tail = ' '.join(tokens[idx:]).strip()
    tail_values = split_tail_fields(tail)
    if not tail_values:
        return None

    membership_type_id = parse_membership_type_id(
        tail_values['membership_type_alias'],
        tail_values['membership_type_id'],
    )

    return {
        'id': member_id,
        'title': title,
        'first_name': first_name,
        'middle_name': tail_values['middle_name'] or None,
        'last_name': last_name,
        'phone_number': phone,
        'country_residence': country_residence,
        'email': email.lower(),
        'is_student': is_student,
        'password_hash': password_hash,
        'password_salt': password_salt,
        'status': status,
        'is_active': is_active,
        'invalid_login_attempts': invalid_login_attempts,
        'is_locked': is_locked,
        'lockout_end_at': lockout_end_at,
        'last_login_at': last_login_at,
        'deactivated': deactivated,
        'deactivated_at': deactivated_at,
        'created_at': created_at,
        'education_level': tail_values['education_level'] or None,
        'employment_status': tail_values['employment_status'] or None,
        'licence_status': tail_values['licence_status'] or None,
        'nurse_licences_raw': tail_values['nurse_licences_raw'],
        'licence_speciality': tail_values['licence_speciality'] or None,
        'other_education': tail_values['other_education'] or None,
        'other_specialty_input': tail_values['other_specialty_input'] or None,
        'position_other_input': tail_values['position_other_input'] or None,
        'position_title': tail_values['position_title'] or None,
        'practice_setting': tail_values['practice_setting'] or None,
        'specialties_raw': tail_values['specialties_raw'],
        'nursing_education_country': tail_values['nursing_education_country'] or None,
        'country_practice': tail_values['country_practice'] or None,
        'membership_type_id': membership_type_id,
        'is_first_login': tail_values['is_first_login'] == '1',
    }


def split_tail_fields(tail: str) -> dict | None:
    end_match = re.search(
        r'\s+([A-Z]{2,3})\s+([A-Z]{2,3})\s+(NULL|[0-9A-F-]{36})\s+([01])\s*$',
        tail,
        re.I,
    )
    if not end_match:
        return None

    nursing_education_country = end_match.group(1)
    country_practice = end_match.group(2)
    membership_type_id = end_match.group(3)
    is_first_login = end_match.group(4)
    body = tail[: end_match.start()].strip()

    parts = body.split()
    if len(parts) < 3:
        return None

    education_level, employment_status, licence_status = parts[:3]
    remainder = ' '.join(parts[3:])

    quoted: list[str] = []
    current = ''
    in_quote = False
    for ch in remainder:
        if ch == '"':
            in_quote = not in_quote
            current += ch
            continue
        if ch.isspace() and not in_quote:
            if current:
                quoted.append(current)
                current = ''
            continue
        current += ch
    if current:
        quoted.append(current)

    if len(quoted) < 9:
        return None

    membership_type_alias = quoted[0]
    middle_name = quoted[1] if quoted[1].upper() != 'NULL' else ''
    nurse_licences_raw = quoted[2]
    other_education = quoted[3] if quoted[3].upper() != 'NULL' else ''
    other_specialty_input = quoted[4] if quoted[4].upper() != 'NULL' else ''
    position_other_input = quoted[5] if quoted[5].upper() != 'NULL' else ''
    position_title = quoted[6]
    practice_setting = quoted[7]
    licence_speciality = quoted[8] if quoted[8].upper() != 'NULL' else ''
    specialties_raw = ' '.join(quoted[9:]) if len(quoted) > 9 else ''

    return {
        'education_level': education_level,
        'employment_status': employment_status,
        'licence_status': licence_status,
        'membership_type_alias': membership_type_alias,
        'middle_name': middle_name,
        'nurse_licences_raw': nurse_licences_raw,
        'other_education': other_education,
        'other_specialty_input': other_specialty_input,
        'position_other_input': position_other_input,
        'position_title': position_title,
        'practice_setting': practice_setting,
        'licence_speciality': licence_speciality,
        'specialties_raw': specialties_raw,
        'nursing_education_country': nursing_education_country,
        'country_practice': country_practice,
        'membership_type_id': membership_type_id,
        'is_first_login': is_first_login,
    }


def parse_member_dues_row(line: str) -> dict | None:
    match = re.match(
        r'^([0-9A-F-]{36})\s+([0-9A-F-]{36})\s+(\S+@\S+)\s+(\S+)\s+([A-Z]{3})\s+([\d.]+)\s+'
        r'(.*?)\s+(PENDING|COMPLETED)\s+(NULL|.*?)\s+(\d{4})\s+'
        r'(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}(?:\.\d+)?)\s+'
        r'(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}(?:\.\d+)?)\s*$',
        line,
        re.I,
    )
    if not match:
        return None

    names = match.group(7).strip().split()
    if len(names) >= 3:
        first_name, middle_name, last_name = names[0], ' '.join(names[1:-1]), names[-1]
    elif len(names) == 2:
        first_name, middle_name, last_name = names[0], '', names[1]
    elif len(names) == 1:
        first_name, middle_name, last_name = names[0], '', ''
    else:
        first_name = middle_name = last_name = ''

    message = match.group(9)
    if message.upper() == 'NULL':
        message = None

    return {
        'id': match.group(1).lower(),
        'member_id': match.group(2).lower(),
        'member_email': match.group(3).lower(),
        'order_id': match.group(4),
        'currency': match.group(5),
        'amount': match.group(6),
        'first_name': first_name,
        'middle_name': middle_name or None,
        'last_name': last_name,
        'status': match.group(8).upper(),
        'message': message,
        'year': int(match.group(10)),
        'created_at': match.group(11),
        'updated_at': match.group(12),
    }


def load_members(path: Path) -> list[dict]:
    rows = []
    for line in path.read_text().splitlines()[2:]:
        if not line or line.startswith('--'):
            continue
        parsed = parse_membership_row(line)
        if parsed:
            rows.append(parsed)
    return rows


def load_dues(path: Path) -> list[dict]:
    rows = []
    for line in path.read_text().splitlines()[2:]:
        if not line or line.startswith('--'):
            continue
        parsed = parse_member_dues_row(line)
        if parsed:
            rows.append(parsed)
    return rows


def deduplicate_members(members: list[dict]) -> tuple[list[dict], dict[str, str]]:
    """Keep the newest legacy row per email; map dropped member IDs to the keeper."""
    grouped: dict[str, list[dict]] = defaultdict(list)
    for member in members:
        grouped[member['email'].lower()].append(member)

    canonical: list[dict] = []
    id_map: dict[str, str] = {}

    for group in grouped.values():
        group.sort(key=lambda member: member['created_at'], reverse=True)
        keeper = group[0]
        canonical.append(keeper)
        for member in group:
            id_map[member['id']] = keeper['id']

    return canonical, id_map


def resolve_dues_member_ids(
    dues: list[dict],
    members: list[dict],
    id_map: dict[str, str],
) -> list[dict]:
    member_ids = {member['id'] for member in members}
    email_to_id = {member['email'].lower(): member['id'] for member in members}
    remapped = []

    for due in dues:
        member_id = id_map.get(due['member_id'], due['member_id'])
        if member_id not in member_ids:
            member_id = email_to_id.get(due['member_email'].lower())
        if member_id not in member_ids:
            member_id = None

        remapped.append({**due, 'member_id': member_id})

    return remapped


def generate_sql(members: list[dict], dues: list[dict]) -> str:
    chunks = [
        '-- Generated by scripts/import-legacy-membership.py',
        '-- Run AFTER supabase/migrations/001_membership_schema.sql',
        '-- Clears any partial import, then loads deduplicated legacy members (unique by email).',
        '',
        'begin;',
        '',
        'truncate table public.member_credentials, public.member_dues, public.members cascade;',
        '',
    ]

    for member in members:
        chunks.append(
            'insert into public.members (\n'
            '  id, title, first_name, middle_name, last_name, phone_number, country_residence, email,\n'
            '  is_student, education_level, employment_status, licence_status, nurse_licences,\n'
            '  licence_speciality, other_education, other_specialty_input, position_other_input,\n'
            '  position_title, practice_setting, specialties, nursing_education_country,\n'
            '  country_practice, membership_type_id, status, is_active, is_first_login,\n'
            '  created_at, last_login_at, deactivated, deactivated_at\n'
            ') values (\n'
            f"  '{member['id']}', {sql_str(member['title'])}, {sql_str(member['first_name'])}, "
            f"{sql_str(member['middle_name'])}, {sql_str(member['last_name'])}, {sql_str(member['phone_number'])}, "
            f"{sql_str(member['country_residence'])}, {sql_str(member['email'])}, {sql_bool(member['is_student'])}, "
            f"{sql_str(member['education_level'])}, {sql_str(member['employment_status'])}, {sql_str(member['licence_status'])}, "
            f"{sql_array_from_raw(member['nurse_licences_raw'])}, {sql_str(member['licence_speciality'])}, "
            f"{sql_str(member['other_education'])}, {sql_str(member['other_specialty_input'])}, "
            f"{sql_str(member['position_other_input'])}, {sql_str(member['position_title'])}, "
            f"{sql_str(member['practice_setting'])}, {sql_array_from_raw(member['specialties_raw'])}, "
            f"{sql_str(member['nursing_education_country'])}, {sql_str(member['country_practice'])}, "
            f"{sql_str(member['membership_type_id'])}, {member['status']}, {sql_bool(member['is_active'])}, "
            f"{sql_bool(member['is_first_login'])}, {sql_str(member['created_at'])}, "
            f"{sql_str(member['last_login_at'])}, {sql_bool(member['deactivated'])}, {sql_str(member['deactivated_at'])}\n"
            ') on conflict (id) do nothing;'
        )
        chunks.append(
            'insert into public.member_credentials (\n'
            '  member_id, password_hash, password_salt, invalid_login_attempts, is_locked, lockout_end_at\n'
            ') values (\n'
            f"  '{member['id']}', {sql_str(member['password_hash'])}, {sql_str(member['password_salt'])}, "
            f"{member['invalid_login_attempts']}, {sql_bool(member['is_locked'])}, {sql_str(member['lockout_end_at'])}\n"
            ') on conflict (member_id) do nothing;'
        )

    for due in dues:
        chunks.append(
            'insert into public.member_dues (\n'
            '  id, member_id, member_email, order_id, currency, amount, first_name, middle_name, last_name,\n'
            '  status, message, year, created_at, updated_at\n'
            ') values (\n'
            f"  '{due['id']}', {sql_str(due['member_id'])}, {sql_str(due['member_email'])}, {sql_str(due['order_id'])}, "
            f"{sql_str(due['currency'])}, {due['amount']}, {sql_str(due['first_name'])}, {sql_str(due['middle_name'])}, "
            f"{sql_str(due['last_name'])}, {sql_str(due['status'])}, {sql_str(due['message'])}, {due['year']}, "
            f"{sql_str(due['created_at'])}, {sql_str(due['updated_at'])}\n"
            ') on conflict (id) do nothing;'
        )

    chunks.extend(['', 'commit;', ''])
    return '\n'.join(chunks)


def main() -> int:
    backup = Path(sys.argv[1]) if len(sys.argv) > 1 else BACKUP_DIR
    members_path = backup / 'Memberships.sql'
    dues_path = backup / 'MemberDueses.sql'

    if not members_path.exists():
        print(f'Missing {members_path}', file=sys.stderr)
        return 1

    raw_members = load_members(members_path)
    members, id_map = deduplicate_members(raw_members)
    dues = (
        resolve_dues_member_ids(load_dues(dues_path), members, id_map)
        if dues_path.exists()
        else []
    )

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(generate_sql(members, dues))

    linked_dues = sum(1 for due in dues if due['member_id'] is not None)
    print(
        f'Parsed {len(raw_members)} members ({len(members)} unique emails), '
        f'{len(dues)} dues ({linked_dues} linked, {len(dues) - linked_dues} unlinked)'
    )
    print(f'Wrote {OUTPUT}')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
