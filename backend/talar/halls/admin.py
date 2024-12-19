from django.contrib import admin
from .models import *


@admin.register(Halls)
class HallsAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'hall', 'start_time', 'end_time', 'event_date',)
    prepopulated_fields = {"slug": ("title",)}

