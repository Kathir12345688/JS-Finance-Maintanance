from django.conf import settings
from twilio.rest import Client


def send_otp_sms(phone: str, code: str) -> None:
    # If Twilio credentials are not configured, allow a dev-friendly fallback.
    # In production this should raise so misconfiguration is obvious.
    if not getattr(settings, 'TWILIO_ACCOUNT_SID', None) or not getattr(settings, 'TWILIO_AUTH_TOKEN', None) or not getattr(settings, 'TWILIO_FROM_NUMBER', None):
        # If in DEBUG mode, log the OTP for local development and return.
        if getattr(settings, 'DEBUG', False):
            import logging

            logger = logging.getLogger(__name__)
            logger.warning('Twilio not configured; development OTP for %s is %s', phone, code)
            return

        # Otherwise raise to indicate missing production configuration
        raise RuntimeError('Twilio SMS settings are not configured.')

    client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
    message = f'Your verification code is {code}. Use this to complete registration.'
    client.messages.create(
        body=message,
        from_=settings.TWILIO_FROM_NUMBER,
        to=phone,
    )
