from datetime import datetime

class IntegrationService:
    @staticmethod
    def emit_procurement_event(event_type: str, payload: dict):
        """
        Log an integration event for future ERP syncing.
        This provides a centralized entry/exit point for decouple architecture.
        """
        # For now, just print to standard out.
        # In a real enterprise system this would push to Kafka, RabbitMQ, SQS, etc.
        print(f"[INTEGRATION] {datetime.now().isoformat()} | EVENT: {event_type} | PAYLOAD: {payload}")
