# Generated by Django 5.0.4 on 2024-12-19 19:02

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('halls', '0005_otp'),
    ]

    operations = [
        migrations.AlterField(
            model_name='otp',
            name='created_at',
            field=models.DateTimeField(auto_now_add=True),
        ),
    ]
