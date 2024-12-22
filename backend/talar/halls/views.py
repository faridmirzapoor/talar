from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from rest_framework.response import Response
from rest_framework import status, viewsets
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from .models import Halls, Event, OTP
from .serializers import HallSerializer, EventSerializer, OTPRequestSerializer, OTPVerifySerializer
from rest_framework.permissions import IsAdminUser


class HallListView(ListAPIView):
    queryset = Halls.objects.all()
    serializer_class = HallSerializer

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        data = [
            {
                "id": hall.id,
                "name_farsi": hall.get_name_display(),
                "name_english": hall.name,
                "capacity": hall.capacity,
                "address": hall.address,
                "slug": hall.slug,
                "image": hall.image.url if hall.image else None
            }
            for hall in self.get_queryset()
        ]
        return Response(data)


class HallDetailView(APIView):
    def get(self, request, hall_name):
        hall = get_object_or_404(Halls, name=hall_name)
        events = Event.objects.filter(hall=hall).order_by('event_date', 'start_time')
        hall_serializer = HallSerializer(hall)
        event_serializer = EventSerializer(events, many=True)
        return Response({
            'hall': hall_serializer.data,
            'events': event_serializer.data,
            'name_farsi': hall.get_name_display(),  # اضافه کردن نام فارسی
            'name_english': hall.name  # اضافه کردن نام انگلیسی
        })



class ReserveRequestView(APIView):    
    def post(self, request, hall_name):
        hall = get_object_or_404(Hall, name=hall_name)        
        data = request.data
        serializer = EventSerializer(data=data)
        if serializer.is_valid():            # ذخیره مستقیم درخواست رزرو با وضعیت "در حال آماده‌سازی"
            serializer.save(hall=hall, status='pending')            
            return Response({"message": "درخواست رزرو ثبت شد."}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class OTPRequestView(APIView):
    def post(self, request):
        serializer = OTPRequestSerializer(data=request.data)
        if serializer.is_valid():
            phone_number = serializer.validated_data['phone_number']
            otp, created = OTP.objects.get_or_create(phone_number=phone_number)
            otp.generate_otp()
            print(f"کد OTP: {otp.code}")  # برای تست
            return Response({"message": "کد OTP ارسال شد."}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class OTPVerifyView(APIView):
    def post(self, request):
        serializer = OTPVerifySerializer(data=request.data)
        if serializer.is_valid():
            return Response({"message": "احراز هویت موفقیت‌آمیز بود."}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AdminEventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all().order_by('event_date', 'start_time')
    serializer_class = EventSerializer
    permission_classes = [IsAdminUser]

    @action(detail=True, methods=['post'])
    def change_status(self, request, pk=None):
        event = self.get_object()
        new_status = request.data.get('status')
        if new_status not in ['approved', 'rejected']:
            return Response({"error": "وضعیت نامعتبر است."}, status=status.HTTP_400_BAD_REQUEST)
        event.status = new_status
        event.save()
        return Response({"message": f"وضعیت رویداد به {new_status} تغییر یافت."})
