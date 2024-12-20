from rest_framework import serializers
from .models import Halls, Event, OTP
import jdatetime


class HallSerializer(serializers.ModelSerializer):
    class Meta:
        model = Halls
        fields = ['id', 'name', 'capacity', 'address', 'slug', 'image']

class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = '__all__'

    def validate(self, data):
        from datetime import time
        # جلوگیری از رزرو در پنجشنبه و جمعه
        if data['event_date'].weekday() in [4, 5]:
            raise serializers.ValidationError("رزرو در پنجشنبه و جمعه امکان‌پذیر نیست.")

        # جلوگیری از رزرو خارج از بازه 9 صبح تا 18
        if not (time(9, 0) <= data['start_time'] <= time(18, 0)):
            raise serializers.ValidationError("ساعات رزرو باید بین 9 صبح تا 18 باشد.")

        # جلوگیری از تداخل با رویدادهای دیگر
        overlapping_events = Event.objects.filter(
            hall=data['hall'],
            event_date=data['event_date'],
            start_time__lt=data['end_time'],
            end_time__gt=data['start_time']
        )
        if overlapping_events.exists():
            raise serializers.ValidationError("این بازه زمانی قبلاً رزرو شده است.")

        return data


class OTPRequestSerializer(serializers.Serializer):
    phone_number = serializers.CharField(max_length=15)

    def validate_phone_number(self, value):
        if not value.isdigit():
            raise serializers.ValidationError("شماره تلفن نامعتبر است.")
        return value


class OTPVerifySerializer(serializers.Serializer):
    phone_number = serializers.CharField(max_length=15)
    code = serializers.CharField(max_length=6)

    def validate(self, data):
        try:
            otp = OTP.objects.get(phone_number=data['phone_number'])
        except OTP.DoesNotExist:
            raise serializers.ValidationError("کد OTP ارسال نشده است.")

        if not otp.is_valid():
            raise serializers.ValidationError("کد OTP منقضی شده است.")

        if otp.code != data['code']:
            raise serializers.ValidationError("کد OTP نادرست است.")
        return data

