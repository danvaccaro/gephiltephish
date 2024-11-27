from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db import models
from django.db.models import Case, When, Value, BooleanField
from .models import Email, Vote
import logging

logger = logging.getLogger(__name__)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_emails(request):
    # Get filter parameters
    show_mine_only = request.GET.get('show_mine', '').lower() == 'true'
    show_unvoted_only = request.GET.get('show_unvoted', '').lower() == 'true'
    
    # Base query
    query = Email.objects.all()
    
    # Apply filters if requested
    if show_mine_only:
        query = query.filter(user=request.user)
    
    # Get all emails and annotate with user's vote status
    emails = query.annotate(
        user_vote=Case(
            When(vote__user=request.user, then=Value(True)),
            default=Value(False),
            output_field=BooleanField(),
        ),
        user_vote_type=Case(
            When(vote__user=request.user, vote__is_phishing=True, then=Value('phishing')),
            When(vote__user=request.user, vote__is_phishing=False, then=Value('legitimate')),
            default=Value(None),
            output_field=models.CharField(),
        ),
        is_mine=Case(
            When(user=request.user, then=Value(True)),
            default=Value(False),
            output_field=BooleanField(),
        )
    )
    
    # Filter unvoted emails if requested
    if show_unvoted_only:
        emails = emails.filter(vote__user=None)
    
    # Order by most recent first
    emails = emails.order_by('-created_at').values(
        'id', 
        'sender_domain', 
        'subject', 
        'content',
        'urls',  # Include URLs field
        'votes_phishing', 
        'votes_legitimate',
        'user_vote',
        'user_vote_type',
        'is_mine'
    )
    
    return Response(list(emails))

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def vote(request):
    logger.info(f"Received vote request from user: {request.user.username}")
    
    try:
        data = request.data
        email_id = data.get('email_id')
        is_phishing = data.get('is_phishing')  # true for phishing, false for legitimate
        
        logger.info(f"Email ID: {email_id}, Is Phishing: {is_phishing}")
        
        # Ensure required data is provided
        if email_id is None or is_phishing is None:
            logger.error("Missing data")
            return Response({'error': 'Missing data'},
                          status=status.HTTP_400_BAD_REQUEST)

        try:
            # Fetch the email object
            email = Email.objects.get(id=email_id)
            logger.info(f"Found email: {email}")

        except Email.DoesNotExist:
            logger.error(f"Email not found: {email_id}")
            return Response({'error': 'Email not found'},
                          status=status.HTTP_404_NOT_FOUND)

        # Check if user has already voted
        existing_vote = Vote.objects.filter(user=request.user, email=email).first()
        if existing_vote:
            # If the vote type is the same, return an error
            if existing_vote.is_phishing == is_phishing:
                return Response({'error': 'You have already voted this way for this email'},
                              status=status.HTTP_400_BAD_REQUEST)
            
            # Decrement the old vote count
            if existing_vote.is_phishing:
                email.votes_phishing = max(0, email.votes_phishing - 1)
            else:
                email.votes_legitimate = max(0, email.votes_legitimate - 1)
            
            # Update the vote
            existing_vote.is_phishing = is_phishing
            existing_vote.save()
        else:
            # Create new vote
            Vote.objects.create(
                user=request.user,
                email=email,
                is_phishing=is_phishing
            )

        # Update vote counts
        if is_phishing:
            email.votes_phishing += 1
        else:
            email.votes_legitimate += 1
        email.save()

        logger.info(f"Updated email votes: Phishing: {email.votes_phishing}, Legitimate: {email.votes_legitimate}")

        return Response({
            'message': 'Vote recorded successfully',
            'votes_phishing': email.votes_phishing,
            'votes_legitimate': email.votes_legitimate
        })
    
    except Exception as e:
        logger.error(f"Unexpected error in vote function: {str(e)}", exc_info=True)
        return Response({'error': 'An unexpected error occurred'},
                      status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_email(request, email_id):
    try:
        # Get the email
        email = Email.objects.get(id=email_id)
        
        # Check if the user owns this email
        if email.user != request.user:
            return Response(
                {'error': 'You can only delete emails you submitted'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Delete the email
        email.delete()
        return Response({'message': 'Email deleted successfully'})
        
    except Email.DoesNotExist:
        return Response(
            {'error': 'Email not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Error deleting email: {str(e)}", exc_info=True)
        return Response(
            {'error': 'An error occurred while deleting the email'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
