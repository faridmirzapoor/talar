from django.db import models
from django_jalali.db import models as jmodels
import random
from datetime import timedelta
from django.utils.timezone import now


class Halls(models.Model):
    class Name(models.TextChoices):
        VAHDAT = "VD", "وحدت",
        ANDISHE = "AN", "اندیشه",
        SABA = "SB", "صبا",
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=2,choices=Name.choices, verbose_name="نام تالار")
    capacity = models.PositiveIntegerField(verbose_name="ظرفیت تالار")
    address = models.TextField(verbose_name="آدرس تالار")
    slug = models.SlugField()
    image = models.ImageField(upload_to='halls_images/', verbose_name="تصویر تالار")

    class Meta:
        verbose_name = "تالار"
        verbose_name_plural = "تالار ها"

    def __str__(self):
        return self.name


class Event(models.Model):
    class Status(models.TextChoices):
        REJECTED = "RJ", "رد شده",
        APPROVED = "AP", "تایید شده",
        PENDING = "PN", "در حال انتظار",

    id = models.AutoField(primary_key=True)
    hall = models.ForeignKey(Halls, on_delete=models.CASCADE, related_name="events", verbose_name="تالار")
    title = models.CharField(max_length=100, verbose_name="عنوان")
    event_date = jmodels.jDateField(verbose_name="تاریخ")
    start_time = models.TimeField(verbose_name="زمان شروع")
    end_time = models.TimeField(verbose_name="زمان پایان")
    slug = models.SlugField(max_length=10, null=True, blank=True, default="evnt", verbose_name="اسلاگ")
    description = models.TextField(max_length=1000, null=True, blank=True, verbose_name="توضیحات")
    status = models.CharField(max_length=2, choices=Status.choices, default=Status.PENDING, verbose_name="وضعیت")
    student_id = models.CharField(max_length=20, blank=True, null=True, verbose_name="شماره دانشجویی")
    phone_number = models.CharField(max_length=15, verbose_name="شماره تماس")
    # event created time
    created = jmodels.jDateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "رویداد"
        verbose_name_plural = "رویداد ها"
        ordering = ['-created']
        indexes = [
            models.Index(fields=['-created'])
        ]

    def __str__(self):
        return (f"{self.title} در تالار {self.hall} در تاریخ {self.event_date}"
                f" از ساعت {self.start_time} الی {self.end_time}")


from django.utils.timezone import now
from datetime import timedelta

class OTP(models.Model):
    phone_number = models.CharField(max_length=15, unique=True)
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)

    def generate_otp(self):
        self.code = ''.join(random.choices('0123456789', k=6))
        self.save()

    def is_valid(self):
        if not self.created_at:
            return False
        current_time = now()
        return current_time - self.created_at < timedelta(minutes=5)




