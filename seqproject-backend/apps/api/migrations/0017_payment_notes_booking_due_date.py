from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0016_booking_discount_fields'),
    ]

    operations = [
        migrations.AddField(
            model_name='payment',
            name='notes',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='booking',
            name='payment_due_date',
            field=models.DateField(
                blank=True,
                null=True,
                help_text='Expected date for outstanding balance payment',
            ),
        ),
    ]
