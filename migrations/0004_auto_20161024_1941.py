# -*- coding: utf-8 -*-
# Generated by Django 1.9.8 on 2016-10-24 10:41
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ytts', '0003_auto_20161024_1933'),
    ]

    operations = [
        migrations.AlterField(
            model_name='subtitles',
            name='version_name',
            field=models.CharField(max_length=20),
        ),
    ]