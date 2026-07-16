import uuid
from django.db import migrations, models


class Migration(migrations.Migration):
    """
    PostgreSQL cannot cast bigint to uuid directly. Instead we:
      1. Add a new uuid column populated with gen_random_uuid()
      2. Drop the old bigint primary key
      3. Drop the old id column
      4. Rename new column to id and set as primary key
    """

    dependencies = [
        ('api', '0018_guestprofile'),
    ]

    operations = [
        migrations.RunSQL(
            sql=[
                # Add the new uuid column (nullable while we populate it)
                "ALTER TABLE api_guestprofile ADD COLUMN new_id uuid DEFAULT gen_random_uuid();",
                # Fill any existing rows that may have NULL (shouldn't happen with DEFAULT, but be safe)
                "UPDATE api_guestprofile SET new_id = gen_random_uuid() WHERE new_id IS NULL;",
                # Make it NOT NULL
                "ALTER TABLE api_guestprofile ALTER COLUMN new_id SET NOT NULL;",
                # Drop the old primary key constraint
                "ALTER TABLE api_guestprofile DROP CONSTRAINT api_guestprofile_pkey;",
                # Drop the old bigint id column
                "ALTER TABLE api_guestprofile DROP COLUMN id;",
                # Rename new column to id
                "ALTER TABLE api_guestprofile RENAME COLUMN new_id TO id;",
                # Set the new id as primary key
                "ALTER TABLE api_guestprofile ADD PRIMARY KEY (id);",
                # Remove the default (Django manages defaults in Python, not DB)
                "ALTER TABLE api_guestprofile ALTER COLUMN id DROP DEFAULT;",
            ],
            reverse_sql=[
                "ALTER TABLE api_guestprofile DROP CONSTRAINT api_guestprofile_pkey;",
                "ALTER TABLE api_guestprofile DROP COLUMN id;",
                "ALTER TABLE api_guestprofile ADD COLUMN id bigserial PRIMARY KEY;",
            ],
        ),
        # Keep Django's migration state in sync with the actual schema
        migrations.AlterField(
            model_name='guestprofile',
            name='id',
            field=models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False),
        ),
    ]
