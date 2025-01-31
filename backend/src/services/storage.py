from typing import Optional, Tuple
import os
import logging
from datetime import datetime, timedelta
import boto3
from botocore.exceptions import ClientError
from fastapi import HTTPException, status
from config.settings import settings

logger = logging.getLogger(__name__)

class StorageService:
    """Service for handling S3 storage operations"""

    def __init__(self):
        """Initialize S3 client"""
        self.s3_client = boto3.client(
            's3',
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_REGION
        )
        self.bucket_name = settings.AWS_BUCKET_NAME

    async def generate_presigned_url(
        self,
        object_key: str,
        expiration: int = 3600,
        operation: str = 'put_object'
    ) -> Tuple[str, str]:
        """
        Generate a presigned URL for uploading a file directly to S3.
        Returns tuple of (presigned_url, final_object_key).
        """
        try:
            # Ensure unique object key by adding timestamp
            timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
            final_object_key = f"{object_key.rsplit('.', 1)[0]}_{timestamp}.{object_key.rsplit('.', 1)[1]}"
            
            url = self.s3_client.generate_presigned_url(
                ClientMethod=operation,
                Params={
                    'Bucket': self.bucket_name,
                    'Key': final_object_key,
                    'ContentType': 'video/*'  # Restrict to video content
                },
                ExpiresIn=expiration
            )
            return url, final_object_key
        except ClientError as e:
            logger.error(f"Error generating presigned URL: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to generate upload URL"
            )

    async def delete_file(self, object_key: str) -> bool:
        """Delete a file from S3"""
        try:
            self.s3_client.delete_object(
                Bucket=self.bucket_name,
                Key=object_key
            )
            return True
        except ClientError as e:
            logger.error(f"Error deleting file from S3: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete file"
            )

    async def get_download_url(self, object_key: str, expiration: int = 3600) -> str:
        """Generate a presigned URL for downloading/viewing a file"""
        try:
            url = self.s3_client.generate_presigned_url(
                ClientMethod='get_object',
                Params={
                    'Bucket': self.bucket_name,
                    'Key': object_key
                },
                ExpiresIn=expiration
            )
            return url
        except ClientError as e:
            logger.error(f"Error generating download URL: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to generate download URL"
            )

    async def check_file_exists(self, object_key: str) -> bool:
        """Check if a file exists in S3"""
        try:
            self.s3_client.head_object(
                Bucket=self.bucket_name,
                Key=object_key
            )
            return True
        except ClientError as e:
            if e.response['Error']['Code'] == '404':
                return False
            logger.error(f"Error checking file existence: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to check file existence"
            )

    async def get_file_size(self, object_key: str) -> Optional[int]:
        """Get the size of a file in S3"""
        try:
            response = self.s3_client.head_object(
                Bucket=self.bucket_name,
                Key=object_key
            )
            return response['ContentLength']
        except ClientError as e:
            logger.error(f"Error getting file size: {str(e)}")
            return None 