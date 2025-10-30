from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from rest_framework.response import Response
from rest_framework import status, viewsets
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from .models import Halls, Event, OTP
from .serializers import HallSerializer, EventSerializer, OTPRequestSerializer, OTPVerifySerializer
from rest_framework.permissions import IsAdminUser
from rest_framework.pagination import PageNumberPagination
from django.core.paginator import Paginator, EmptyPage

# views.py
from django.db.models import Count, Q

class ApplicantsListView(APIView):
    def get(self, request):
        # دریافت پارامترهای جستجو و pagination
        search_query = request.query_params.get('search', '').strip()
        page_number = request.query_params.get('page', 1)
        page_size = int(request.query_params.get('page_size', 30))
        
        # گرفتن لیست یکتای student_id ها با تعداد درخواست‌هایشان
        applicants_query = Event.objects.values('student_id', 'phone_number').annotate(
            total_events=Count('id'),
            pending_events=Count('id', filter=Q(status=Event.Status.PENDING)),
            approved_events=Count('id', filter=Q(status=Event.Status.APPROVED)),
            rejected_events=Count('id', filter=Q(status=Event.Status.REJECTED))
        ).order_by('-total_events')
        
        # اعمال فیلتر جستجو
        if search_query:
            applicants_query = applicants_query.filter(
                Q(student_id__icontains=search_query) | 
                Q(phone_number__icontains=search_query)
            )
        
        # Pagination
        paginator = Paginator(list(applicants_query), page_size)
        
        try:
            page_obj = paginator.page(page_number)
        except EmptyPage:
            return Response({
                "count": paginator.count,
                "next": None,
                "previous": None,
                "results": []
            })
        
        # ساخت URL برای صفحات
        request_url = request.build_absolute_uri()
        base_url = request_url.split('?')[0]
        
        next_url = None
        previous_url = None
        
        if page_obj.has_next():
            next_params = request.query_params.copy()
            next_params['page'] = page_obj.next_page_number()
            next_url = f"{base_url}?{next_params.urlencode()}"
        
        if page_obj.has_previous():
            prev_params = request.query_params.copy()
            prev_params['page'] = page_obj.previous_page_number()
            previous_url = f"{base_url}?{prev_params.urlencode()}"
        
        return Response({
            "count": paginator.count,
            "next": next_url,
            "previous": previous_url,
            "results": page_obj.object_list
        })


class ApplicantEventsView(APIView):
    def get(self, request, student_id):
        # دریافت تمام ایونت‌های یک student_id خاص
        events = Event.objects.filter(student_id=student_id).order_by('-event_date', '-start_time')
        
        # Pagination (اختیاری)
        page_number = request.query_params.get('page', 1)
        page_size = int(request.query_params.get('page_size', 50))
        
        paginator = Paginator(events, page_size)
        
        try:
            page_obj = paginator.page(page_number)
        except EmptyPage:
            return Response({
                "count": paginator.count,
                "next": None,
                "previous": None,
                "results": []
            })
        
        serializer = EventSerializer(page_obj.object_list, many=True)
        
        # ساخت URL
        request_url = request.build_absolute_uri()
        base_url = request_url.split('?')[0]
        
        next_url = None
        previous_url = None
        
        if page_obj.has_next():
            next_params = request.query_params.copy()
            next_params['page'] = page_obj.next_page_number()
            next_url = f"{base_url}?{next_params.urlencode()}"
        
        if page_obj.has_previous():
            prev_params = request.query_params.copy()
            prev_params['page'] = page_obj.previous_page_number()
            previous_url = f"{base_url}?{prev_params.urlencode()}"
        
        return Response({
            "count": paginator.count,
            "next": next_url,
            "previous": previous_url,
            "results": serializer.data
        })


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

class EventPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class HallEventsListView(APIView):
    def get(self, request, hall_name):
        try:
            hall = Halls.objects.get(name=hall_name)
        except Halls.DoesNotExist:
            return Response({"error": "Hall not found"}, status=404)

        # گرفتن همه ایونت‌ها
        events = hall.events.all()
        
        # فیلتر بر اساس وضعیت
        status = request.query_params.get('status', None)
        if status and status != 'ALL':
            events = events.filter(status=status)
        
        # مرتب‌سازی
        ordering = request.query_params.get('ordering', '-event_date,-start_time')
        order_fields = ordering.split(',')
        events = events.order_by(*order_fields)
        
        # دریافت پارامترهای pagination
        page_number = request.query_params.get('page', 1)
        page_size = int(request.query_params.get('page_size', 10))
        
        # استفاده از Django Paginator
        paginator = Paginator(events, page_size)
        
        try:
            page_obj = paginator.page(page_number)
        except EmptyPage:
            # اگر صفحه خارج از محدوده باشد
            return Response({
                "count": paginator.count,
                "next": None,
                "previous": None,
                "results": []
            })
        
        # سریالایز کردن نتایج
        serializer = EventSerializer(page_obj.object_list, many=True)
        
        # ساخت URL برای صفحه بعد و قبل
        request_url = request.build_absolute_uri()
        base_url = request_url.split('?')[0]
        
        next_url = None
        previous_url = None
        
        if page_obj.has_next():
            next_params = request.query_params.copy()
            next_params['page'] = page_obj.next_page_number()
            next_url = f"{base_url}?{next_params.urlencode()}"
        
        if page_obj.has_previous():
            prev_params = request.query_params.copy()
            prev_params['page'] = page_obj.previous_page_number()
            previous_url = f"{base_url}?{prev_params.urlencode()}"
        
        # Response به فرمت استاندارد pagination
        return Response({
            "count": paginator.count,
            "next": next_url,
            "previous": previous_url,
            "results": serializer.data
        })
class ReserveRequestView(APIView):    
    def post(self, request, hall_name):
        hall = get_object_or_404(Halls, name=hall_name)        
        data = request.data
        serializer = EventSerializer(data=data)
        print(request.data)
        if serializer.is_valid():            # ذخیره مستقیم درخواست رزرو با وضعیت "در حال آماده‌سازی"
            serializer.save(hall=hall, status=Event.Status.PENDING)            
            return Response({"message": "درخواست رزرو ثبت شد."}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class EventChangeStatusView(APIView):
    def patch(self, request, event_id):
        try:
            event = Event.objects.get(id=event_id)
        except Event.DoesNotExist:
            return Response({"error": "Event not found"}, status=status.HTTP_404_NOT_FOUND)

        new_status = request.data.get("status")
        if new_status not in [Event.Status.PENDING, Event.Status.APPROVED, Event.Status.REJECTED]:
            return Response({"error": "Invalid status"}, status=status.HTTP_400_BAD_REQUEST)

        event.status = new_status
        event.save()
        return Response({"message": f"Event status updated to {new_status}"}, status=status.HTTP_200_OK)

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
