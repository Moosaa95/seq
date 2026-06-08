from django.db import migrations
import cloudinary.models


class Migration(migrations.Migration):

    dependencies = [
        ('account', '0003_add_must_change_password'),
    ]

    operations = [
        migrations.AddField(
            model_name='customuser',
            name='profile_image',
            field=cloudinary.models.CloudinaryField(
                blank=True,
                null=True,
                verbose_name='profile_image',
            ),
        ),
    ]
