"""add membership constraints

Revision ID: 18761bcc5513
Revises: 0b9a804ef655
Create Date: 2026-06-30 21:57:51.536373
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "18761bcc5513"
down_revision: Union[str, Sequence[str], None] = "0b9a804ef655"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    # Make role NOT NULL
    op.alter_column(
        "collaboration_memberships",
        "role",
        existing_type=sa.VARCHAR(),
        nullable=False,
    )

    # Prevent duplicate memberships
    op.create_unique_constraint(
        "uq_collaboration_user",
        "collaboration_memberships",
        ["collaboration_id", "user_id"],
    )

    # Add max_members column
    op.add_column(
        "collaborations",
        sa.Column(
            "max_members",
            sa.Integer(),
            nullable=True,
        ),
    )

    # Add required_skills with default [] for existing rows
    op.add_column(
        "collaborations",
        sa.Column(
            "required_skills",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=False,
            server_default=sa.text("'[]'::jsonb"),
        ),
    )

    # Optional: remove the database default so application controls it
    op.alter_column(
        "collaborations",
        "required_skills",
        server_default=None,
    )

    # Make description nullable
    op.alter_column(
        "collaborations",
        "description",
        existing_type=sa.VARCHAR(length=500),
        nullable=True,
    )


def downgrade() -> None:
    """Downgrade schema."""

    op.alter_column(
        "collaborations",
        "description",
        existing_type=sa.VARCHAR(length=500),
        nullable=False,
    )

    op.drop_column("collaborations", "required_skills")
    op.drop_column("collaborations", "max_members")

    op.drop_constraint(
        "uq_collaboration_user",
        "collaboration_memberships",
        type_="unique",
    )

    op.alter_column(
        "collaboration_memberships",
        "role",
        existing_type=sa.VARCHAR(),
        nullable=True,
    )