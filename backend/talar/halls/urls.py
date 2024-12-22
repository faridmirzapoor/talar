
from django.urls import path 
from .views import HallListView, HallDetailView, ReserveRequestView 
 
urlpatterns = [ 
    path('halls/', HallListView.as_view(), name='hall_list'), 
    path('halls/<str:hall_name>/', HallDetailView.as_view(), name='hall_detail'), 
    path('halls/<str:hall_name>/reserve/', ReserveRequestView.as_view(), name='reserve_request'), 
]