from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0017_payment_notes_booking_due_date'),
    ]

    operations = [
        migrations.CreateModel(
            name='GuestProfile',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('name', models.CharField(max_length=255)),
                ('email', models.EmailField(blank=True, max_length=254, null=True)),
                ('phone', models.CharField(blank=True, max_length=50, null=True)),
                ('address', models.TextField(blank=True, null=True)),
                ('id_type', models.CharField(blank=True, max_length=50, null=True)),
                ('notes', models.TextField(blank=True, null=True)),
            ],
            options={
                'verbose_name_plural': 'Guest Profiles',
                'ordering': ['name'],
            },
        ),
    ]
