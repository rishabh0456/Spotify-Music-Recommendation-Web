from django.urls import path
from api import views

urlpatterns = [
    path('health/',             views.health_check,         name='health'),
    path('search/',             views.search,               name='search'),
    path('recommend/',          views.recommend,            name='recommend'),
    path('recommend/spotify/',  views.recommend_by_spotify, name='recommend_spotify'),
    path('recommend/mood/',     views.recommend_by_mood,    name='recommend_mood'),
    path('track/',              views.track_details,        name='track_details'),
]