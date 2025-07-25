# Generated by Django 4.2.11 on 2025-05-26 18:45

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Notification',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('content', models.TextField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('is_read', models.BooleanField(default=False)),
                ('type', models.CharField(choices=[('LIKE', 'Like'), ('DISLIKE', 'Dislike'), ('COMMENT', 'Comment'), ('TAG', 'Tag')], default='COMMENT', max_length=20)),
            ],
        ),
    ]
