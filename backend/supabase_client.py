"""
Supabase integration utilities
"""
from supabase import create_client, Client
from config import Config
from functools import lru_cache
from datetime import date, datetime
import os
from urllib.parse import urlparse, unquote

@lru_cache(maxsize=1)
def get_supabase_client() -> Client:
    """Get or create Supabase client"""
    key = Config.SUPABASE_SERVICE_ROLE_KEY or Config.SUPABASE_KEY
    return create_client(Config.SUPABASE_URL, key)

class SupabaseStorage:
    """Handler for Supabase Storage operations"""
    
    def __init__(self):
        self.supabase = get_supabase_client()
    
    def upload_photo(self, file, bucket: str = None, folder: str = "family_photos"):
        """Upload photo to Supabase Storage"""
        try:
            import uuid
            bucket = bucket or Config.SUPABASE_STORAGE_BUCKET
            # Generate unique filename to avoid conflicts
            file_ext = os.path.splitext(file.filename)[1]
            unique_filename = f"{uuid.uuid4()}{file_ext}"
            file_path = f"{folder}/{unique_filename}"
            
            print(f"Uploading file to {bucket}/{file_path}")
            response = self.supabase.storage.from_(bucket).upload(
                file_path,
                file.read(),
                {'content-type': file.content_type or 'application/octet-stream'}
            )
            print(f"Upload response: {response}")
            
            public_url = self.get_public_url(bucket, file_path)
            print(f"Public URL: {public_url}")
            return public_url
        except Exception as e:
            print(f"Error uploading file: {str(e)}")
            import traceback
            traceback.print_exc()
            return None
    
    def get_public_url(self, bucket: str, path: str) -> str:
        """Get public URL for uploaded file"""
        return self.supabase.storage.from_(bucket).get_public_url(path)
    
    def delete_photo(self, path: str, bucket: str = None):
        """Delete photo from Supabase Storage"""
        try:
            bucket = bucket or Config.SUPABASE_STORAGE_BUCKET
            storage_path = self._storage_path_from_url(path, bucket)
            self.supabase.storage.from_(bucket).remove([storage_path])
            return True
        except Exception as e:
            print(f"Error deleting file: {e}")
            return False

    def _storage_path_from_url(self, value: str, bucket: str) -> str:
        """Return Supabase object path from either a stored path or public URL."""
        if not value:
            return value

        parsed = urlparse(value)
        if not parsed.scheme:
            return value

        marker = f"/storage/v1/object/public/{bucket}/"
        if marker in parsed.path:
            return unquote(parsed.path.split(marker, 1)[1])

        return value

class SupabaseDatabase:
    """Handler for Supabase Database operations"""
    
    def __init__(self):
        self.supabase = get_supabase_client()
    
    def query(self, table: str, filters: dict = None):
        """Query data from table"""
        query = self.supabase.table(table).select("*")
        if filters:
            for key, value in filters.items():
                query = query.eq(key, value)
        return query.execute()

    def _serialize_value(self, value):
        """Convert Python values into JSON-safe payloads for Supabase."""
        if isinstance(value, (datetime, date)):
            return value.isoformat()
        if isinstance(value, dict):
            return {k: self._serialize_value(v) for k, v in value.items() if v is not None}
        if isinstance(value, list):
            return [self._serialize_value(item) for item in value]
        return value
    
    def insert(self, table: str, data: dict):
        """Insert data into table - filters out None values"""
        cleaned_data = self._serialize_value(data)
        return self.supabase.table(table).insert(cleaned_data).execute()
    
    def update(self, table: str, data: dict, filters: dict):
        """Update data in table"""
        serialized_data = self._serialize_value(data)
        query = self.supabase.table(table).update(serialized_data)
        for key, value in filters.items():
            query = query.eq(key, value)
        return query.execute()
    
    def delete(self, table: str, filters: dict):
        """Delete data from table"""
        query = self.supabase.table(table).delete()
        for key, value in filters.items():
            query = query.eq(key, value)
        return query.execute()

# Initialize instances
supabase_storage = SupabaseStorage()
supabase_db = SupabaseDatabase()
