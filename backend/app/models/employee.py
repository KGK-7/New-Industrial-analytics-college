# app/models/employee.py
from sqlalchemy import Column, String, Integer, DateTime
from sqlalchemy.dialects.postgresql import JSONB, ARRAY
from app.core.database import Base
from datetime import datetime

class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, autoincrement=True)
    employee_id = Column(String, unique=True, nullable=True, index=True)
    name = Column(String, nullable=False, index=True)
    email = Column(String, nullable=False, unique=True, index=True)
    department = Column(String, nullable=True, index=True)
    role = Column(String, nullable=True, default="User")
    status = Column(String, nullable=True, default="Active", index=True)
    modules = Column(ARRAY(String), nullable=True, default=[])
    custom_fields = Column(JSONB, default={})
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

