from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('account', '0004_customuser_profile_image'),
    ]

    operations = [
        migrations.AddField(
            model_name='userrole',
            name='allowed_locations',
            field=models.JSONField(
                default=list,
                help_text='List of location IDs this role can access. Empty = access all locations (when location:read is granted).',
            ),
        ),
    ]
