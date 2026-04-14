from sqlalchemy import Column, Integer, String, Numeric, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import JSONB
from app.core.database import Base

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(String, unique=True, nullable=True, index=True)
    name = Column(String, nullable=False, index=True)
    manager = Column(JSONB, nullable=False, default=[])
    team_lead = Column(JSONB, nullable=True, default=[])
    status = Column(String, default="Planning", index=True)
    budget = Column(Numeric(15, 2), default=0.0)
    utilized_budget = Column(Numeric(15, 2), default=0.0)
    balance_budget = Column(Numeric(15, 2), default=0.0)
    timeline = Column(String, nullable=True)
    employee_id = Column(String, ForeignKey("employees.employee_id", ondelete="SET NULL"), nullable=True, index=True)
    custom_fields = Column(JSONB, default={})

    # Relationship to Employee model
    employee = relationship("Employee", foreign_keys=[employee_id], primaryjoin="Project.employee_id == Employee.employee_id")

