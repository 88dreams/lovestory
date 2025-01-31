"""Logging utility functions"""
import logging
import sys
from typing import Optional
from pathlib import Path

def setup_logger(
    name: str,
    level: int = logging.INFO,
    log_file: Optional[str] = None,
    format_string: Optional[str] = None
) -> logging.Logger:
    """Set up a logger with console and optional file handlers"""
    if format_string is None:
        format_string = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"

    logger = logging.getLogger(name)
    logger.setLevel(level)

    # Create formatter
    formatter = logging.Formatter(format_string)

    # Create console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)

    # Create file handler if log_file is specified
    if log_file:
        # Ensure log directory exists
        log_path = Path(log_file)
        log_path.parent.mkdir(parents=True, exist_ok=True)

        file_handler = logging.FileHandler(log_file)
        file_handler.setFormatter(formatter)
        logger.addHandler(file_handler)

    return logger

def log_exception(
    logger: logging.Logger,
    exc: Exception,
    message: str = "An error occurred",
    level: int = logging.ERROR
) -> None:
    """Log an exception with traceback"""
    logger.log(
        level,
        f"{message}: {str(exc)}",
        exc_info=True
    ) 