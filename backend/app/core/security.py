"""JWT token handling and password hashing utilities."""

from datetime import datetime, timedelta, timezone

from cryptography.fernet import Fernet
from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plain: str) -> str:
    """Hash a plain-text password using bcrypt."""
    return pwd_context.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    """Verify a plain-text password against a bcrypt hash."""
    return pwd_context.verify(plain, hashed)


def create_access_token(data: dict) -> str:
    """Create a JWT access token with an expiry claim."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_token(token: str) -> dict:
    """
    Decode and verify a JWT token.
    
    Returns:
        dict: Decoded JWT payload.
    
    Raises:
        JWTError: If token decoding or verification fails.
    """
    try:
        payload = jwt.decode(
            token, settings.SUPABASE_JWT_SECRET, algorithms=[settings.ALGORITHM]
        )
        return payload
    except JWTError:
        raise


def encrypt_secret(plaintext: str) -> str:
    """
    Encrypts a plaintext secret into a Fernet token.
    
    Parameters:
        plaintext (str): The secret string to encrypt.
    
    Returns:
        ciphertext (str): URL-safe base64-encoded Fernet token representing the encrypted secret.
    """
    f = Fernet(settings.ENCRYPTION_KEY.encode())
    return f.encrypt(plaintext.encode()).decode()


def decrypt_secret(ciphertext: str) -> str:
    """
    Decrypts a Fernet ciphertext and returns the original plaintext.
    
    Parameters:
        ciphertext (str): Fernet token (URL-safe base64 string) to decrypt.
    
    Returns:
        plaintext (str): Decrypted plaintext string.
    """
    f = Fernet(settings.ENCRYPTION_KEY.encode())
    return f.decrypt(ciphertext.encode()).decode()
