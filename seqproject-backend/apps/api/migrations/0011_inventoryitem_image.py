from django.db import migrations
import cloudinary.models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0010_location_plain_text_fields'),
    ]

    operations = [
        migrations.AddField(
            model_name='inventoryitem',
            name='image',
            field=cloudinary.models.CloudinaryField(
                blank=True,
                null=True,
                verbose_name='image',
            ),
        ),
    ]
