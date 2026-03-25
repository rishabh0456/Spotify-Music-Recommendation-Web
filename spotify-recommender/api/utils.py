from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status

def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is not None:
        error_payload = {
            'success': False,
            'error': {
                'status_code': response.status_code,
                'message': response.data if isinstance(response.data, str)
                           else response.data.get('detail', 'An error occurred.'),
            }
        }
        return Response(error_payload, status=response.status_code)

    return Response({
        'success': False,
        'error': {
            'status_code': 500,
            'message': 'Internal server error. Please try again later.',
        }
    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)