# -*- coding: utf-8 -*-
# Generated by Django 1.9.8 on 2016-10-24 10:33
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('ytts', '0002_auto_20161020_2249'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='subtitles',
            unique_together=set([('video_id', 'version_name'), ('video_id', 'is_default_version')]),
        ),
    ]
