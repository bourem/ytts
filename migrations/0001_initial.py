# -*- coding: utf-8 -*-
# Generated by Django 1.9.8 on 2016-10-07 11:20
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Subtitles',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('video_id', models.CharField(max_length=20)),
                ('subtitles_json', models.TextField()),
            ],
        ),
    ]