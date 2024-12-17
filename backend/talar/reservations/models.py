from django.db import models
from django.utils import timezone
from django_jalali.db import models as jmodels


class Hall(models.Model):
    class Name(models.TextChoices):
        VAHDAT = "VD", "وحدت"
        ANDISHE= "AN", "اندیشه"
        SABA = "SB", "صبا"

    name = models.CharField(max_length=2, choices=Name.choices, default="VD")
    capacity = models.IntegerField()
    description = models.TextField(max_length=1000, blank=True, null=True)

    def __str__(self):
        return self.name


class TimeSlot(models.Model):
    hall = models.ForeignKey(Hall, on_delete=models.CASCADE, related_name='time_slots')
    day_of_week = models.CharField(max_length=10, choices=[
        ('Saturday', 'شنبه'),
        ('Sunday', 'یک‌شنبه'),
        ('Monday', 'دو‌شنبه'),
        ('Tuesday', 'سه‌شنبه'),
        ('Wednesday', 'چهارشنبه'),
    ])
    start_time = models.TimeField()  # شروع بازه زمانی
    end_time = models.TimeField()  # پایان بازه زمانی
    is_reserved = models.BooleanField(default=False)  # وضعیت بازه (رزرو شده یا نه)

    def __str__(self):
        return f"{self.hall.name} - {self.day_of_week} - {self.start_time} تا {self.end_time}"


class ReservationRequest(models.Model):
    class Status(models.TextChoices):
        PENDING = "PN", "در حال بررسی"
        APPROVED = "AP", "تایید شده"
        REJECTED = "RJ", "رد شده"

    full_name = models.CharField(max_length=20, verbose_name="نام و نام خانوادگی")
    student_id = models.CharField(max_length=20, verbose_name="شماره دانشجویی")
    phone_number = models.CharField(max_length=15, verbose_name="شماره تماس")
    hall = models.ForeignKey(Hall, on_delete=models.CASCADE)
    event_topic = models.CharField(max_length=200, verbose_name="عنوان و موضوع مراسم")
    date = jmodels.jDateField()
    time_slots = models.ManyToManyField(TimeSlot)
    status = models.CharField(max_length=2, choices=Status, default="PN")
    created_at = models.DateTimeField(default=timezone.now)  # زمان ثبت درخواست

    def __str__(self):
        return f"{self.full_name} - {self.hall.name} - {self.date}"





