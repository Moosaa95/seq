from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0008_remove_apartment_location_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='property',
            name='address',
            field=models.TextField(blank=True, help_text='Full street address of the property', null=True),
        ),
        migrations.AddField(
            model_name='property',
            name='latitude',
            field=models.DecimalField(blank=True, decimal_places=6, help_text='GPS latitude (e.g. 9.072264)', max_digits=9, null=True),
        ),
        migrations.AddField(
            model_name='property',
            name='longitude',
            field=models.DecimalField(blank=True, decimal_places=6, help_text='GPS longitude (e.g. 7.491302)', max_digits=9, null=True),
        ),
    ]
