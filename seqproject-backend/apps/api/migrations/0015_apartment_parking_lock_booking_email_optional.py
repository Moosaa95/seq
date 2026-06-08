from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0014_payment_beneficiary_apartment_house_rules'),
    ]

    operations = [
        migrations.RenameField(
            model_name='apartment',
            old_name='garages',
            new_name='parking',
        ),
        migrations.AddField(
            model_name='apartment',
            name='is_locked',
            field=models.BooleanField(
                default=False,
                help_text='Locked for repairs or maintenance — unavailable for booking',
            ),
        ),
        migrations.AddField(
            model_name='apartment',
            name='lock_reason',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
        migrations.AlterField(
            model_name='booking',
            name='email',
            field=models.EmailField(blank=True, max_length=254, null=True),
        ),
    ]
