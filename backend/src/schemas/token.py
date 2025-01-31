from pydantic import BaseModel

class Token(BaseModel):
    """Token schema for access token"""
    access_token: str
    token_type: str

class TokenPair(Token):
    """Token schema for both access and refresh tokens"""
    refresh_token: str 