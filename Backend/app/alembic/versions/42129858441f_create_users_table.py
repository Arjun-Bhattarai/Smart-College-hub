"""create users table

Revision ID: 42129858441f
Revises: 
Create Date: 2026-06-25 19:29:47.673044
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '42129858441f'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'users',
        sa.Column('uid', sa.UUID(), nullable=False),

        sa.Column('title', sa.String(length=100), nullable=True),
        sa.Column('username', sa.String(length=100), nullable=False),
        sa.Column('email', sa.String(length=100), nullable=False),
        sa.Column('first_name', sa.String(length=100), nullable=True),
        sa.Column('last_name', sa.String(length=100), nullable=True),

        sa.Column('role', sa.String(), server_default='user', nullable=False),
        sa.Column('is_verified', sa.Boolean(), nullable=False, server_default=sa.false()),

        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),

        sa.Column('password', sa.String(), nullable=False),

        sa.PrimaryKeyConstraint('uid')
    )

    op.create_index('ix_users_email', 'users', ['email'], unique=True)
    op.create_index('ix_users_username', 'users', ['username'], unique=True)


def downgrade() -> None:
    op.drop_index('ix_users_username', table_name='users')
    op.drop_index('ix_users_email', table_name='users')
    op.drop_table('users')