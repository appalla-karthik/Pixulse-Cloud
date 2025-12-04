from django.core.management.commands.runserver import Command as RunServerCommand
from django.core.management import call_command
from django.db import connection
from django.db.migrations.executor import MigrationExecutor

class Command(RunServerCommand):
    def handle(self, *args, **options):
        # Check if migrations need to be run
        executor = MigrationExecutor(connection)
        plan = executor.migration_plan(executor.loader.graph.leaf_nodes())
        
        if plan:
            self.stdout.write(self.style.SUCCESS('Running migrations...'))
            call_command('migrate', '--noinput')
            self.stdout.write(self.style.SUCCESS('Migrations completed.'))
        
        # Call the original runserver
        super().handle(*args, **options)
