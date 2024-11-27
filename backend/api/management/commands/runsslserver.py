from django.core.management.base import BaseCommand
from django.core.management.commands.runserver import Command as RunserverCommand
import os
import ssl
from django.conf import settings

class Command(RunserverCommand):
    help = 'Runs the server with SSL/HTTPS support'

    def handle(self, *args, **options):
        # Set default port to 8000 if not specified
        if not options.get('addrport'):
            options['addrport'] = '8000'

        # Add SSL certificate options
        options['cert_path'] = settings.SSL_CERTIFICATE
        options['key_path'] = settings.SSL_PRIVATE_KEY

        # Ensure the certificate files exist
        if not os.path.exists(options['cert_path']):
            self.stderr.write(f"SSL certificate not found at {options['cert_path']}")
            return
        if not os.path.exists(options['key_path']):
            self.stderr.write(f"SSL private key not found at {options['key_path']}")
            return

        # Create SSL context
        ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
        ssl_context.load_cert_chain(
            certfile=options['cert_path'],
            keyfile=options['key_path']
        )
        
        # Add SSL context to options
        options['ssl_context'] = ssl_context

        # Add SSL options to the server
        self.stdout.write(f"Starting HTTPS server at port {options['addrport']}...")
        super().handle(*args, **options)

    def get_handler(self, *args, **options):
        """
        Returns the django.core.servers.basehttp.WSGIServer subclass to use based
        on the options.
        """
        handler = super().get_handler(*args, **options)
        handler.ssl_context = options.get('ssl_context')
        return handler

    def inner_run(self, *args, **options):
        # Disable SSL redirect for local development
        settings.SECURE_SSL_REDIRECT = False
        super().inner_run(*args, **options)
