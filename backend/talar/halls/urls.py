from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import HallListView, HallDetailView, ReserveRequestView, OTPRequestView, OTPVerifyView, AdminEventViewSet

router = DefaultRouter()
router.register(r'controlpannel', AdminEventViewSet, basename='admin_events')

urlpatterns = [
    path('halls/', HallListView.as_view(), name='hall_list'),
    path('halls/<str:hall_name>/', HallDetailView.as_view(), name='hall_detail'),
    path('halls/<str:hall_name>/reserve/', ReserveRequestView.as_view(), name='reserve_request'),
    path('otp/request/', OTPRequestView.as_view(), name='otp_request'),
    path('otp/verify/', OTPVerifyView.as_view(), name='otp_verify'),
    path('', include(router.urls)),
]
