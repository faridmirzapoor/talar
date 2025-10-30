
from django.urls import path 
from .views import HallListView, HallDetailView, ReserveRequestView, HallEventsListView, EventChangeStatusView, ApplicantsListView, ApplicantEventsView
 
urlpatterns = [ 
    path('halls/', HallListView.as_view(), name='hall_list'), 
    path('halls/<str:hall_name>/', HallDetailView.as_view(), name='hall_detail'), 
    path('halls/<str:hall_name>/reserve/', ReserveRequestView.as_view(), name='reserve_request'), 
    path('<str:hall_name>/events/', HallEventsListView.as_view(), name='hall_events'),
    path('events/<int:event_id>/', EventChangeStatusView.as_view(), name='event_change_status'),
    path('applicants/', ApplicantsListView.as_view(), name='applicants_list'),
    path('applicants/<str:student_id>/events/', ApplicantEventsView.as_view(), name='applicant_events'),

]