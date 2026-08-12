from sqlalchemy.orm import configure_mappers

import silly_teamwork.models  # noqa: F401
from silly_teamwork.db.base import Base


def test_all_expected_tables_are_registered() -> None:
    configure_mappers()

    assert set(Base.metadata.tables) == {
        "files",
        "invitation_codes",
        "project_members",
        "projects",
        "system_admins",
        "task_members",
        "tasks",
        "team_members",
        "teams",
        "users",
    }


def test_membership_tables_prevent_duplicate_members() -> None:
    expected_unique_columns = {
        "team_members": {"team_id", "user_id"},
        "project_members": {"project_id", "user_id"},
        "task_members": {"task_id", "user_id"},
    }

    for table_name, expected_columns in expected_unique_columns.items():
        table = Base.metadata.tables[table_name]
        unique_column_sets = {
            frozenset(column.name for column in constraint.columns)
            for constraint in table.constraints
            if constraint.__class__.__name__ == "UniqueConstraint"
        }
        assert frozenset(expected_columns) in unique_column_sets


def test_every_business_table_has_standard_audit_columns() -> None:
    for table_name, table in Base.metadata.tables.items():
        if table_name == "system_admins":
            assert {"id", "user_id", "role", "created_at"} == set(table.columns.keys())
            continue
        assert {"id", "created_at", "updated_at"}.issubset(table.columns.keys())


def test_user_email_is_optional() -> None:
    assert Base.metadata.tables["users"].c.email.nullable is True
