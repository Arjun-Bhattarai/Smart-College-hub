"""add challenge resources tables

Revision ID: b2f4c9d7a111
Revises: 7ddd99c099fa
Create Date: 2026-08-04 10:10:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = "b2f4c9d7a111"
down_revision: Union[str, Sequence[str], None] = "7ddd99c099fa"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "challenge_resource_requests",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("challenge_id", sa.Uuid(), nullable=False),
        sa.Column("requester_id", sa.Uuid(), nullable=False),
        sa.Column("message", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["challenge_id"], ["coding_challenges.id"]),
        sa.ForeignKeyConstraint(["requester_id"], ["users.uid"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_challenge_resource_requests_challenge_id"),
        "challenge_resource_requests",
        ["challenge_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_challenge_resource_requests_requester_id"),
        "challenge_resource_requests",
        ["requester_id"],
        unique=False,
    )

    op.create_table(
        "challenge_resources",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("challenge_id", sa.Uuid(), nullable=False),
        sa.Column("uploader_id", sa.Uuid(), nullable=False),
        sa.Column("title", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column("description", sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column("file_name", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column("file_path", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["challenge_id"], ["coding_challenges.id"]),
        sa.ForeignKeyConstraint(["uploader_id"], ["users.uid"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_challenge_resources_challenge_id"),
        "challenge_resources",
        ["challenge_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_challenge_resources_uploader_id"),
        "challenge_resources",
        ["uploader_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_challenge_resources_uploader_id"), table_name="challenge_resources")
    op.drop_index(op.f("ix_challenge_resources_challenge_id"), table_name="challenge_resources")
    op.drop_table("challenge_resources")

    op.drop_index(
        op.f("ix_challenge_resource_requests_requester_id"),
        table_name="challenge_resource_requests",
    )
    op.drop_index(
        op.f("ix_challenge_resource_requests_challenge_id"),
        table_name="challenge_resource_requests",
    )
    op.drop_table("challenge_resource_requests")
